// Gmail Row Highlighter Content Script

const STORAGE_KEY = 'gmailRowHighlighterRules';
const DATA_ATTRIBUTE = 'data-highlight-rule-id';
const PROCESSED_ATTRIBUTE = 'data-highlight-processed';

let rules = [];
let observer = null;
let processingTimeout = null;
let messageListContainer = null;
let lastContainerCheck = 0;
let navigationObserver = null;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Watch for Gmail navigation (SPA navigation)
function watchForNavigation() {
  // Observe the main content area for major DOM changes
  const mainContent = document.querySelector('[role="main"]') || document.body;

  if (navigationObserver) {
    navigationObserver.disconnect();
  }

  navigationObserver = new MutationObserver((mutations) => {
    // Check if the message list container has been replaced
    const currentContainer = findMessageListContainer();

    if (currentContainer !== messageListContainer) {
      // Container changed - likely a page navigation
      console.log('Gmail Row Highlighter: Detected page navigation, re-initializing...');
      messageListContainer = currentContainer;

      if (messageListContainer) {
        // Re-setup observer on new container
        setupObserver();
        // Process rows after a short delay to let Gmail finish loading
        setTimeout(() => {
          processAllRows();
        }, 500);
      }
    }
  });

  navigationObserver.observe(mainContent, {
    childList: true,
    subtree: true
  });
}

// Main initialization
async function init() {
  try {
    // Wait for Gmail to load
    await waitForGmail();

    // Load rules from storage
    await loadRules();

    // Set up storage change listener
    // Note: We add the listener each time, but it's safe to do so
    chrome.storage.onChanged.addListener(handleStorageChange);

    // Watch for Gmail navigation
    watchForNavigation();

    // Find message list container
    messageListContainer = findMessageListContainer();

    if (messageListContainer) {
      // Process existing rows
      processAllRows();

      // Set up MutationObserver
      setupObserver();
    } else {
      console.warn('Gmail Row Highlighter: Could not find message list container');
      // Retry after a delay
      setTimeout(() => {
        messageListContainer = findMessageListContainer();
        if (messageListContainer) {
          processAllRows();
          setupObserver();
        }
      }, 2000);
    }

    // Periodically check for container changes (fallback for navigation detection)
    setInterval(() => {
      const currentContainer = findMessageListContainer();
      if (currentContainer && currentContainer !== messageListContainer) {
        console.log('Gmail Row Highlighter: Container changed, re-initializing...');
        messageListContainer = currentContainer;
        setupObserver();
        setTimeout(() => processAllRows(), 300);
      }
    }, 2000);

  } catch (error) {
    console.error('Gmail Row Highlighter: Initialization error', error);
  }
}

// Wait for Gmail to be ready
function waitForGmail() {
  return new Promise((resolve) => {
    // Check if Gmail is loaded by looking for common Gmail elements
    const checkGmail = () => {
      const gmailIndicators = [
        document.querySelector('[role="main"]'),
        document.querySelector('table[role="grid"]'),
        document.querySelector('tbody')
      ];

      if (gmailIndicators.some(el => el !== null)) {
        resolve();
      } else {
        setTimeout(checkGmail, 100);
      }
    };

    // Start checking after a short delay
    setTimeout(checkGmail, 500);

    // Timeout after 10 seconds
    setTimeout(resolve, 10000);
  });
}

// Find message list container
function findMessageListContainer() {
  // Try multiple selectors for robustness
  const selectors = [
    'table[role="grid"] tbody',
    'div[role="main"] table tbody',
    'tbody[role="presentation"]',
    'table tbody'
  ];

  for (const selector of selectors) {
    const container = document.querySelector(selector);
    if (container) {
      return container;
    }
  }

  return null;
}

// Load rules from storage
function loadRules() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEY], (result) => {
      try {
        if (result[STORAGE_KEY] && Array.isArray(result[STORAGE_KEY])) {
          // Keep ALL rules (including disabled) so we can check them when removing highlights
          rules = result[STORAGE_KEY];
        } else {
          rules = [];
        }
      } catch (error) {
        console.error('Gmail Row Highlighter: Error loading rules', error);
        rules = [];
      }
      resolve();
    });
  });
}

// Handle storage changes
function handleStorageChange(changes, areaName) {
  if (areaName === 'sync' && changes[STORAGE_KEY]) {
    loadRules().then(() => {
      // Re-process all visible rows when rules change
      // Use a small delay to ensure DOM is ready
      setTimeout(() => {
        processAllRows();
      }, 100);
    });
  }
}

// Set up MutationObserver
function setupObserver() {
  if (!messageListContainer) return;

  // Disconnect existing observer
  if (observer) {
    observer.disconnect();
  }

  observer = new MutationObserver((mutations) => {
    // Debounce processing
    clearTimeout(processingTimeout);
    processingTimeout = setTimeout(() => {
      processMutationChanges(mutations);
    }, 150);
  });

  observer.observe(messageListContainer, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'aria-label']
  });
}

// Process mutation changes
function processMutationChanges(mutations) {
  const rowsToProcess = new Set();

  for (const mutation of mutations) {
    // Handle added nodes
    if (mutation.addedNodes) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if it's a row or contains rows
          if (isMessageRow(node)) {
            rowsToProcess.add(node);
          } else {
            // Check for rows within the added node
            const rows = node.querySelectorAll && node.querySelectorAll('tr');
            if (rows) {
              rows.forEach(row => {
                if (isMessageRow(row)) {
                  rowsToProcess.add(row);
                }
              });
            }
          }
        }
      }
    }

    // Handle attribute changes (e.g., read/unread status, labels)
    // But skip our own attributes to avoid infinite loops
    if (mutation.type === 'attributes' && mutation.target) {
      const attrName = mutation.attributeName;
      if (attrName && !attrName.startsWith('data-highlight')) {
        const row = findParentRow(mutation.target);
        if (row && isMessageRow(row)) {
          rowsToProcess.add(row);
        }
      }
    }
  }

  // Process collected rows
  rowsToProcess.forEach(row => processRow(row));
}

// Check if element is a message row
function isMessageRow(element) {
  if (!element || element.tagName !== 'TR') return false;

  // Check for Gmail row indicators
  const hasRowClass = element.classList.contains('zA') ||
    element.classList.contains('zE') ||
    element.classList.contains('yO');
  const hasRowRole = element.getAttribute('role') === 'row';

  return hasRowClass || hasRowRole;
}

// Find parent row element
function findParentRow(element) {
  let current = element;
  while (current && current.tagName !== 'TR') {
    current = current.parentElement;
    if (!current || current === document.body) return null;
  }
  return current;
}

// Process all visible rows
function processAllRows() {
  if (!messageListContainer) {
    // Try to find container again
    messageListContainer = findMessageListContainer();
    if (!messageListContainer) {
      console.warn('Gmail Row Highlighter: Cannot process rows - container not found');
      return;
    }
  }

  const rows = messageListContainer.querySelectorAll('tr');
  let processedCount = 0;

  rows.forEach(row => {
    if (isMessageRow(row)) {
      processRow(row);
      processedCount++;
    }
  });

  if (processedCount > 0) {
    console.log(`Gmail Row Highlighter: Processed ${processedCount} rows`);
  }
}

// Process a single row
function processRow(row) {
  if (!row) return;

  try {
    // Extract row data
    const rowData = extractRowData(row);

    // Check if we have valid data (at least one field populated)
    const hasValidData = rowData.sender || rowData.subject || rowData.labels.length > 0;

    // Check rules
    const matchingRule = findMatchingRule(rowData);

    // Get current highlight state
    const currentRuleId = row.getAttribute(DATA_ATTRIBUTE);
    const currentRule = currentRuleId ? rules.find(r => r.id === currentRuleId) : null;

    // Apply or update highlight
    if (matchingRule) {
      // We found a matching rule - apply it
      // Only update if it's different from current
      if (!currentRuleId || currentRuleId !== matchingRule.id) {
        applyHighlight(row, matchingRule);
      }
    } else if (currentRuleId) {
      // No matching rule found, but row has a highlight
      // First check if the current rule exists and is enabled
      if (!currentRule) {
        // Rule was deleted - remove highlight
        removeHighlight(row);
      } else if (currentRule.enabled === false) {
        // Rule is disabled - always remove highlight
        removeHighlight(row);
      } else if (hasValidData) {
        // Rule exists and is enabled, but doesn't match current data
        // Re-check if current rule still matches with current data
        const stillMatches = checkRuleMatch(rowData, currentRule);
        if (!stillMatches) {
          // Rule no longer matches - remove highlight
          removeHighlight(row);
        }
        // If it still matches, keep the highlight
      }
      // If we don't have valid data and rule is enabled, preserve existing highlight (defensive approach)
    } else {
      // No matching rule and no existing highlight - ensure it's clean
      removeHighlight(row);
    }

    // Mark as processed
    row.setAttribute(PROCESSED_ATTRIBUTE, 'true');
  } catch (error) {
    console.error('Gmail Row Highlighter: Error processing row', error);
  }
}

// Check if text contains any of the comma-separated patterns (OR logic)
// Each pattern is matched as a complete phrase (not word-by-word)
function matchesAnyPattern(text, patternString) {
  if (!text || !patternString) return false;

  const textLower = text.toLowerCase();
  // Split by comma and trim each term
  const patterns = patternString.split(',').map(p => p.trim()).filter(p => p.length > 0);

  // Check if any complete pattern matches
  for (const pattern of patterns) {
    if (textLower.includes(pattern.toLowerCase())) {
      return true;
    }
  }

  return false;
}

// Check if a specific rule matches row data
function checkRuleMatch(rowData, rule) {
  if (!rule || rule.enabled === false || !rule.pattern) return false;

  const pattern = rule.pattern.trim();

  switch (rule.type) {
    case 'sender_contains':
      return rowData.sender && matchesAnyPattern(rowData.sender, pattern);
    case 'subject_contains':
      return rowData.subject && matchesAnyPattern(rowData.subject, pattern);
    case 'sender_or_subject_contains':
      const senderMatch = rowData.sender && matchesAnyPattern(rowData.sender, pattern);
      const subjectMatch = rowData.subject && matchesAnyPattern(rowData.subject, pattern);
      return senderMatch || subjectMatch;
    case 'label_contains':
      if (!rowData.labels || rowData.labels.length === 0) return false;
      return rowData.labels.some(label => matchesAnyPattern(label, pattern));
    default:
      return false;
  }
}

// Extract data from row
function extractRowData(row) {
  const data = {
    sender: '',
    subject: '',
    labels: []
  };

  try {
    // Check if we have cached sender data (from previous extraction)
    const cachedSender = row.getAttribute('data-cached-sender');
    if (cachedSender && cachedSender.includes('@')) {
      data.sender = cachedSender;
    }

    // Extract sender - try multiple approaches
    // First, try to get email attribute
    if (!data.sender) {
      const emailAttrElements = row.querySelectorAll('[email]');
      for (const el of emailAttrElements) {
        const email = el.getAttribute('email');
        if (email && email.includes('@')) {
          data.sender = email.trim();
          break;
        }
      }
    }

    // If no email attribute, try text content from sender cell
    if (!data.sender) {
      const senderSelectors = [
        '.yW span[email]',
        '.yW',
        'span[data-hovercard-id]',
        'td span[email]',
        'td[class*="yW"] span',
        'td[class*="yW"]'
      ];

      for (const selector of senderSelectors) {
        const senderEl = row.querySelector(selector);
        if (senderEl) {
          const email = senderEl.getAttribute('email') || senderEl.textContent || '';
          if (email.trim()) {
            data.sender = email.trim();
            // If it's not an email, try to extract email from it
            if (!data.sender.includes('@')) {
              const emailMatch = data.sender.match(/[\w.-]+@[\w.-]+\.\w+/);
              if (emailMatch) {
                data.sender = emailMatch[0];
              }
            }
            if (data.sender && data.sender.includes('@')) break;
          }
        }
      }
    }

    // Fallback: search for email-like patterns in the entire row
    if (!data.sender || !data.sender.includes('@')) {
      const emailPattern = /[\w.-]+@[\w.-]+\.\w+/;
      const rowText = row.textContent || '';
      const match = rowText.match(emailPattern);
      if (match) {
        data.sender = match[0];
      }
    }

    // Cache the sender for future use
    if (data.sender && data.sender.includes('@')) {
      row.setAttribute('data-cached-sender', data.sender);
    }

    // Extract subject
    const subjectSelectors = [
      '.bqe',
      '.y6',
      'span[data-thread-perm-id]',
      '.bog'
    ];

    for (const selector of subjectSelectors) {
      const subjectEl = row.querySelector(selector);
      if (subjectEl) {
        data.subject = (subjectEl.textContent || '').trim();
        if (data.subject) break;
      }
    }

    // Extract labels
    const labelSelectors = [
      '.ar',
      '.at',
      '[data-label-name]',
      'span[title]'
    ];

    const labelElements = [];
    for (const selector of labelSelectors) {
      const elements = row.querySelectorAll(selector);
      labelElements.push(...Array.from(elements));
    }

    // Get unique label texts
    const labelTexts = new Set();
    labelElements.forEach(el => {
      const labelText = el.getAttribute('data-label-name') ||
        el.getAttribute('title') ||
        el.textContent || '';
      if (labelText.trim()) {
        labelTexts.add(labelText.trim());
      }
    });

    data.labels = Array.from(labelTexts);

  } catch (error) {
    console.error('Gmail Row Highlighter: Error extracting row data', error);
  }

  return data;
}

// Find matching rule
function findMatchingRule(rowData) {
  // Ensure we have valid row data
  if (!rowData) return null;

  for (const rule of rules) {
    if (rule.enabled === false) continue;
    if (!rule.pattern || !rule.pattern.trim()) continue;

    const pattern = rule.pattern.trim();

    switch (rule.type) {
      case 'sender_contains':
        if (rowData.sender && matchesAnyPattern(rowData.sender, pattern)) {
          return rule;
        }
        break;

      case 'subject_contains':
        if (rowData.subject && matchesAnyPattern(rowData.subject, pattern)) {
          return rule;
        }
        break;

      case 'sender_or_subject_contains':
        const senderMatch = rowData.sender && matchesAnyPattern(rowData.sender, pattern);
        const subjectMatch = rowData.subject && matchesAnyPattern(rowData.subject, pattern);
        if (senderMatch || subjectMatch) {
          return rule;
        }
        break;

      case 'label_contains':
        if (rowData.labels && rowData.labels.length > 0) {
          for (const label of rowData.labels) {
            if (label && matchesAnyPattern(label, pattern)) {
              return rule;
            }
          }
        }
        break;
    }
  }

  return null;
}

// Apply highlight to row
function applyHighlight(row, rule) {
  try {
    // Remove any existing highlight
    removeHighlight(row);

    // Apply new highlight
    row.setAttribute(DATA_ATTRIBUTE, rule.id);
    row.classList.add('gmail-row-highlighter');

    // Use a safe color fallback
    const color = rule.backgroundColor || '#FFF7CC';
    row.style.backgroundColor = color;

    // Store rule ID and color for reference
    row.setAttribute('data-highlight-color', color);
  } catch (error) {
    console.error('Gmail Row Highlighter: Error applying highlight', error);
  }
}

// Remove highlight from row
function removeHighlight(row) {
  try {
    row.removeAttribute(DATA_ATTRIBUTE);
    row.removeAttribute('data-highlight-color');
    row.classList.remove('gmail-row-highlighter');
    row.style.backgroundColor = '';
  } catch (error) {
    console.error('Gmail Row Highlighter: Error removing highlight', error);
  }
}


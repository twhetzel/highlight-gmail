// Storage key for rules
const STORAGE_KEY = 'gmailRowHighlighterRules';

// Rule types
const RULE_TYPES = {
  SENDER_CONTAINS: 'sender_contains',
  SUBJECT_CONTAINS: 'subject_contains',
  LABEL_CONTAINS: 'label_contains',
  SENDER_OR_SUBJECT_CONTAINS: 'sender_or_subject_contains'
};

// Default color
const DEFAULT_COLOR = '#FFF7CC';

// DOM elements
let rules = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeColorPicker();
  setupForm();
  setupClickOutsideHandler();
  setupEditFormColorSync();
  attachRuleEventListeners(); // Attach once using event delegation
  loadRules();
});

// Initialize color picker sync
function initializeColorPicker() {
  const colorInput = document.getElementById('ruleColor');
  const colorText = document.getElementById('ruleColorText');
  
  colorInput.addEventListener('input', (e) => {
    colorText.value = e.target.value.toUpperCase();
  });
  
  colorText.addEventListener('click', () => {
    colorInput.click();
  });
}

// Setup form submission
function setupForm() {
  const form = document.getElementById('addRuleForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addRule();
  });
}

// Load rules from storage
function loadRules() {
  chrome.storage.sync.get([STORAGE_KEY], (result) => {
    try {
      if (result[STORAGE_KEY] && Array.isArray(result[STORAGE_KEY])) {
        rules = result[STORAGE_KEY];
      } else {
        rules = [];
      }
      renderRules();
    } catch (error) {
      console.error('Error loading rules:', error);
      showStatus('Error loading rules', 'error');
      rules = [];
      renderRules();
    }
  });
}

// Render rules list
function renderRules() {
  const rulesList = document.getElementById('rulesList');
  
  if (rules.length === 0) {
    rulesList.innerHTML = '<div class="empty-state">No rules yet. Add a rule above to get started.</div>';
    return;
  }
  
  rulesList.innerHTML = rules.map(rule => {
    const typeLabel = getTypeLabel(rule.type);
    const typeClass = getTypeClass(rule.type);
    const disabledClass = rule.enabled === false ? 'disabled' : '';
    const ruleId = rule.id;
    const color = rule.backgroundColor.toUpperCase();
    
    return `
      <div class="rule-item ${disabledClass}" data-rule-id="${ruleId}">
        <div class="rule-info">
          <span class="rule-type ${typeClass}">${typeLabel}</span>
          <span class="rule-pattern">${escapeHtml(rule.pattern)}</span>
          <div class="rule-color">
            <div class="color-swatch" 
                 style="background-color: ${color}" 
                 data-rule-id="${ruleId}"
                 title="Click to edit color"></div>
            <span class="color-code" id="color-display-${ruleId}">${color}</span>
            <div class="color-picker-inline" id="color-picker-${ruleId}">
              <input type="color" 
                     id="color-input-${ruleId}" 
                     value="${color}"
                     data-rule-id="${ruleId}">
              <input type="text" 
                     id="color-text-${ruleId}" 
                     value="${color}"
                     data-rule-id="${ruleId}"
                     placeholder="#FFFFFF">
              <button data-rule-id="${ruleId}" class="save-color-btn">Save</button>
              <button class="btn-secondary cancel-color-btn" data-rule-id="${ruleId}">Cancel</button>
            </div>
          </div>
        </div>
        <div class="rule-actions">
          <button class="btn-edit edit-rule-btn" data-rule-id="${ruleId}">Edit</button>
          <button class="btn-secondary toggle-rule-btn" data-rule-id="${ruleId}">
            ${rule.enabled !== false ? 'Disable' : 'Enable'}
          </button>
          <button class="btn-danger delete-rule-btn" data-rule-id="${ruleId}">Delete</button>
        </div>
        <div class="rule-edit-form" id="edit-form-${ruleId}">
          <div class="form-group">
            <label>Rule Type</label>
            <select id="edit-type-${ruleId}" class="edit-rule-type">
              <option value="sender_contains" ${rule.type === 'sender_contains' ? 'selected' : ''}>Sender Contains</option>
              <option value="subject_contains" ${rule.type === 'subject_contains' ? 'selected' : ''}>Subject Contains</option>
              <option value="sender_or_subject_contains" ${rule.type === 'sender_or_subject_contains' ? 'selected' : ''}>Sender or Subject Contains</option>
              <option value="label_contains" ${rule.type === 'label_contains' ? 'selected' : ''}>Label Contains</option>
            </select>
          </div>
          <div class="form-group">
            <label>Pattern</label>
            <input type="text" 
                   id="edit-pattern-${ruleId}" 
                   class="edit-rule-pattern"
                   value="${escapeHtml(rule.pattern)}"
                   placeholder="e.g., @client.com, Contract:, NIAID">
          </div>
          <div class="form-group">
            <label>Background Color</label>
            <div class="color-input-group">
              <input type="color" 
                     id="edit-color-${ruleId}" 
                     class="edit-rule-color"
                     value="${color}">
              <input type="text" 
                     id="edit-color-text-${ruleId}" 
                     class="edit-rule-color-text"
                     value="${color}"
                     readonly>
            </div>
          </div>
          <div class="form-actions">
            <button class="save-edit-btn" data-rule-id="${ruleId}">Save Changes</button>
            <button class="btn-secondary cancel-edit-btn" data-rule-id="${ruleId}">Cancel</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // Note: Event listeners are attached once via event delegation in initialization
  // No need to re-attach on every render
}

// Get type label
function getTypeLabel(type) {
  const labels = {
    [RULE_TYPES.SENDER_CONTAINS]: 'Sender',
    [RULE_TYPES.SUBJECT_CONTAINS]: 'Subject',
    [RULE_TYPES.LABEL_CONTAINS]: 'Label',
    [RULE_TYPES.SENDER_OR_SUBJECT_CONTAINS]: 'Sender or Subject'
  };
  return labels[type] || type;
}

// Get type CSS class
function getTypeClass(type) {
  const classes = {
    [RULE_TYPES.SENDER_CONTAINS]: 'sender',
    [RULE_TYPES.SUBJECT_CONTAINS]: 'subject',
    [RULE_TYPES.LABEL_CONTAINS]: 'label',
    [RULE_TYPES.SENDER_OR_SUBJECT_CONTAINS]: 'sender-or-subject'
  };
  return classes[type] || '';
}

// Add new rule
function addRule() {
  const type = document.getElementById('ruleType').value;
  const pattern = document.getElementById('rulePattern').value.trim();
  const color = document.getElementById('ruleColor').value;
  
  // Validate
  const validation = validateRule(type, pattern, color);
  if (!validation.valid) {
    showValidationError(validation.error);
    return;
  }
  
  // Create rule object
  const rule = {
    id: generateId(),
    type: type,
    pattern: pattern,
    backgroundColor: color.toUpperCase(),
    enabled: true
  };
  
  // Add to rules array
  rules.push(rule);
  
  // Save to storage
  saveRules();
  
  // Reset form
  document.getElementById('addRuleForm').reset();
  document.getElementById('ruleColor').value = DEFAULT_COLOR;
  document.getElementById('ruleColorText').value = DEFAULT_COLOR;
  clearValidationError();
  
  // Show success
  showStatus('Rule added successfully', 'success');
}

// Delete rule
function deleteRule(id) {
  if (confirm('Are you sure you want to delete this rule?')) {
    rules = rules.filter(rule => rule.id !== id);
    saveRules();
    showStatus('Rule deleted', 'success');
  }
}

// Toggle rule enabled/disabled
function toggleRule(id) {
  const rule = rules.find(r => r.id === id);
  if (rule) {
    // Toggle: if currently false (or undefined), set to true; if true, set to false
    if (rule.enabled === false) {
      rule.enabled = true;
    } else {
      rule.enabled = false;
    }
    saveRules();
    showStatus(`Rule ${rule.enabled ? 'enabled' : 'disabled'}`, 'success');
  }
}

// Save rules to storage
function saveRules() {
  chrome.storage.sync.set({ [STORAGE_KEY]: rules }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error saving rules:', chrome.runtime.lastError);
      showStatus('Error saving rules: ' + chrome.runtime.lastError.message, 'error');
    } else {
      renderRules();
    }
  });
}

// Validate rule
function validateRule(type, pattern, color) {
  // Validate type
  if (!Object.values(RULE_TYPES).includes(type)) {
    return { valid: false, error: 'Invalid rule type' };
  }
  
  // Validate pattern
  if (!pattern || pattern.length === 0) {
    return { valid: false, error: 'Pattern cannot be empty' };
  }
  
  if (pattern.length > 200) {
    return { valid: false, error: 'Pattern is too long (max 200 characters)' };
  }
  
  // Validate color
  if (!isValidColor(color)) {
    return { valid: false, error: 'Invalid color' };
  }
  
  return { valid: true };
}

// Check if color is valid
function isValidColor(color) {
  if (!color) return false;
  
  // Check hex color
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    return true;
  }
  
  // Check named colors (basic check)
  const s = new Option().style;
  s.color = color;
  return s.color !== '';
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Show status message
function showStatus(message, type = 'success') {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status-message show ${type}`;
  
  // Auto-dismiss after 2 seconds
  setTimeout(() => {
    statusEl.classList.remove('show');
  }, 2000);
}

// Show validation error
function showValidationError(message) {
  const errorEl = document.getElementById('patternError');
  errorEl.textContent = message;
  errorEl.classList.add('show');
}

// Clear validation error
function clearValidationError() {
  const errorEl = document.getElementById('patternError');
  errorEl.classList.remove('show');
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Show color picker for editing
function showColorPicker(ruleId, event) {
  // Stop event propagation to prevent immediate closing
  if (event) {
    event.stopPropagation();
  }
  
  // Hide all other color pickers
  document.querySelectorAll('.color-picker-inline').forEach(picker => {
    picker.classList.remove('show');
  });
  
  // Show this color picker
  const picker = document.getElementById(`color-picker-${ruleId}`);
  
  if (picker) {
    picker.classList.add('show');
    
    // Sync color input with current color
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      const colorInput = document.getElementById(`color-input-${ruleId}`);
      const colorText = document.getElementById(`color-text-${ruleId}`);
      if (colorInput) colorInput.value = rule.backgroundColor;
      if (colorText) colorText.value = rule.backgroundColor.toUpperCase();
    }
  }
}

// Update color text input when color picker changes
function updateColorInput(ruleId, color) {
  const colorText = document.getElementById(`color-text-${ruleId}`);
  if (colorText) {
    colorText.value = color.toUpperCase();
  }
  // Also update the color input value in case it's different format
  const colorInput = document.getElementById(`color-input-${ruleId}`);
  if (colorInput && colorInput.value !== color) {
    colorInput.value = color;
  }
}

// Update color picker when text input changes
function updateColorFromText(ruleId, colorText) {
  // Validate hex color
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorText)) {
    const colorInput = document.getElementById(`color-input-${ruleId}`);
    if (colorInput) {
      colorInput.value = colorText;
    }
  }
}

// Save color change
function saveColorChange(ruleId) {
  const colorInput = document.getElementById(`color-input-${ruleId}`);
  if (!colorInput) return;
  
  const newColor = colorInput.value.toUpperCase();
  
  // Validate color
  if (!isValidColor(newColor)) {
    showStatus('Invalid color', 'error');
    return;
  }
  
  // Find and update rule
  const rule = rules.find(r => r.id === ruleId);
  if (rule) {
    rule.backgroundColor = newColor;
    saveRules();
    
    // Hide color picker
    const picker = document.getElementById(`color-picker-${ruleId}`);
    if (picker) {
      picker.classList.remove('show');
    }
    
    // Update display
    const swatch = document.querySelector(`[data-rule-id="${ruleId}"] .color-swatch`);
    const display = document.getElementById(`color-display-${ruleId}`);
    if (swatch) {
      swatch.style.backgroundColor = newColor;
    }
    if (display) {
      display.textContent = newColor;
    }
    
    showStatus('Color updated', 'success');
  }
}

// Cancel color edit
function cancelColorEdit(ruleId) {
  const picker = document.getElementById(`color-picker-${ruleId}`);
  if (picker) {
    picker.classList.remove('show');
  }
  
  // Reset to original color
  const rule = rules.find(r => r.id === ruleId);
  if (rule) {
    const colorInput = document.getElementById(`color-input-${ruleId}`);
    const colorText = document.getElementById(`color-text-${ruleId}`);
    if (colorInput) colorInput.value = rule.backgroundColor;
    if (colorText) colorText.value = rule.backgroundColor.toUpperCase();
  }
}

// Attach event listeners to rule elements using event delegation
let eventListenersAttached = false;

function attachRuleEventListeners() {
  const rulesList = document.getElementById('rulesList');
  if (!rulesList || eventListenersAttached) return;
  
  eventListenersAttached = true;
  
  // Use event delegation for all dynamic elements
  rulesList.addEventListener('click', (e) => {
    // Color swatch click
    if (e.target.classList.contains('color-swatch')) {
      e.stopPropagation();
      const ruleId = e.target.getAttribute('data-rule-id');
      if (ruleId) {
        showColorPicker(ruleId, e);
      }
      return;
    }
    
    // Save color button
    if (e.target.classList.contains('save-color-btn')) {
      e.stopPropagation();
      const ruleId = e.target.getAttribute('data-rule-id');
      if (ruleId) {
        saveColorChange(ruleId);
      }
      return;
    }
    
    // Cancel color button
    if (e.target.classList.contains('cancel-color-btn')) {
      e.stopPropagation();
      const ruleId = e.target.getAttribute('data-rule-id');
      if (ruleId) {
        cancelColorEdit(ruleId);
      }
      return;
    }
    
    // Toggle rule button
    if (e.target.classList.contains('toggle-rule-btn')) {
      const ruleId = e.target.getAttribute('data-rule-id');
      if (ruleId) {
        toggleRule(ruleId);
      }
      return;
    }
    
    // Delete rule button
    if (e.target.classList.contains('delete-rule-btn')) {
      const ruleId = e.target.getAttribute('data-rule-id');
      if (ruleId) {
        deleteRule(ruleId);
      }
      return;
    }
    
    // Edit rule button
    if (e.target.classList.contains('edit-rule-btn')) {
      e.stopPropagation();
      const ruleId = e.target.getAttribute('data-rule-id');
      if (ruleId) {
        showEditForm(ruleId);
      }
      return;
    }
    
    // Save edit button
    if (e.target.classList.contains('save-edit-btn')) {
      e.stopPropagation();
      const ruleId = e.target.getAttribute('data-rule-id');
      if (ruleId) {
        saveRuleEdit(ruleId);
      }
      return;
    }
    
    // Cancel edit button
    if (e.target.classList.contains('cancel-edit-btn')) {
      e.stopPropagation();
      const ruleId = e.target.getAttribute('data-rule-id');
      if (ruleId) {
        cancelRuleEdit(ruleId);
      }
      return;
    }
  });
  
  // Color input change handlers
  rulesList.addEventListener('input', (e) => {
    const ruleId = e.target.getAttribute('data-rule-id');
    if (!ruleId) return;
    
    // Color picker input
    if (e.target.type === 'color') {
      updateColorInput(ruleId, e.target.value);
      return;
    }
    
    // Color text input
    if (e.target.id && e.target.id.startsWith('color-text-')) {
      updateColorFromText(ruleId, e.target.value);
      return;
    }
  });
}

// Setup click outside handler to close color pickers and edit forms
function setupClickOutsideHandler() {
  document.addEventListener('click', (e) => {
    // If clicking outside a color picker and color swatch, close all pickers
    const isInsidePicker = e.target.closest('.color-picker-inline');
    const isColorSwatch = e.target.closest('.color-swatch');
    const isPickerButton = e.target.closest('.color-picker-inline button');
    
    if (!isInsidePicker && !isColorSwatch && !isPickerButton) {
      document.querySelectorAll('.color-picker-inline').forEach(picker => {
        picker.classList.remove('show');
      });
    }
    
    // If clicking outside an edit form, close all edit forms
    const isInsideEditForm = e.target.closest('.rule-edit-form');
    const isEditButton = e.target.closest('.edit-rule-btn');
    
    if (!isInsideEditForm && !isEditButton) {
      document.querySelectorAll('.rule-edit-form').forEach(form => {
        form.classList.remove('show');
      });
    }
  });
}

// Setup color sync for edit forms
function setupEditFormColorSync() {
  // Use event delegation for dynamically created edit forms
  document.addEventListener('input', (e) => {
    if (e.target.classList.contains('edit-rule-color')) {
      const ruleId = e.target.id.replace('edit-color-', '');
      const colorText = document.getElementById(`edit-color-text-${ruleId}`);
      if (colorText) {
        colorText.value = e.target.value.toUpperCase();
      }
    }
  });
}

// Show edit form for a rule
function showEditForm(ruleId) {
  // Hide all other edit forms
  document.querySelectorAll('.rule-edit-form').forEach(form => {
    form.classList.remove('show');
  });
  
  // Hide all color pickers
  document.querySelectorAll('.color-picker-inline').forEach(picker => {
    picker.classList.remove('show');
  });
  
  // Show this edit form
  const editForm = document.getElementById(`edit-form-${ruleId}`);
  if (editForm) {
    editForm.classList.add('show');
    
    // Scroll into view if needed
    editForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Save rule edit
function saveRuleEdit(ruleId) {
  const typeInput = document.getElementById(`edit-type-${ruleId}`);
  const patternInput = document.getElementById(`edit-pattern-${ruleId}`);
  const colorInput = document.getElementById(`edit-color-${ruleId}`);
  
  if (!typeInput || !patternInput || !colorInput) {
    showStatus('Error: Could not find edit form fields', 'error');
    return;
  }
  
  const type = typeInput.value;
  const pattern = patternInput.value.trim();
  const color = colorInput.value.toUpperCase();
  
  // Validate
  const validation = validateRule(type, pattern, color);
  if (!validation.valid) {
    showStatus(validation.error, 'error');
    return;
  }
  
  // Find and update rule
  const rule = rules.find(r => r.id === ruleId);
  if (rule) {
    rule.type = type;
    rule.pattern = pattern;
    rule.backgroundColor = color;
    
    // Save to storage
    saveRules();
    
    // Hide edit form
    const editForm = document.getElementById(`edit-form-${ruleId}`);
    if (editForm) {
      editForm.classList.remove('show');
    }
    
    showStatus('Rule updated successfully', 'success');
  } else {
    showStatus('Error: Rule not found', 'error');
  }
}

// Cancel rule edit
function cancelRuleEdit(ruleId) {
  const editForm = document.getElementById(`edit-form-${ruleId}`);
  if (editForm) {
    editForm.classList.remove('show');
  }
  
  // Reset form fields to original values
  const rule = rules.find(r => r.id === ruleId);
  if (rule) {
    const typeInput = document.getElementById(`edit-type-${ruleId}`);
    const patternInput = document.getElementById(`edit-pattern-${ruleId}`);
    const colorInput = document.getElementById(`edit-color-${ruleId}`);
    const colorText = document.getElementById(`edit-color-text-${ruleId}`);
    
    if (typeInput) typeInput.value = rule.type;
    if (patternInput) patternInput.value = rule.pattern;
    if (colorInput) colorInput.value = rule.backgroundColor;
    if (colorText) colorText.value = rule.backgroundColor.toUpperCase();
  }
}

// Make functions available globally for onclick handlers
window.deleteRule = deleteRule;
window.toggleRule = toggleRule;
window.showColorPicker = showColorPicker;
window.updateColorInput = updateColorInput;
window.updateColorFromText = updateColorFromText;
window.saveColorChange = saveColorChange;
window.cancelColorEdit = cancelColorEdit;


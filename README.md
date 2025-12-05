# Gmail Row Highlighter

A Chrome extension that highlights Gmail message rows based on user-defined rules. You can highlight emails by sender, subject, or label criteria with custom background colors.

## Features

- **Flexible Rule Matching**: Create rules to match emails by:
  - Sender (email address or name)
  - Subject line
  - Sender or Subject (matches if pattern appears in either field)
  - Gmail labels
- **OR Pattern Matching**: Use comma-separated patterns for OR logic (e.g., `googledev,GDG,Google Cloud`)
- **Custom Colors**: Choose any background color for each rule
- **Edit Rules**: Modify rule type, pattern, or color after creation
- **Edit Colors**: Click any color swatch to quickly change a rule's color
- **Real-time Updates**: Rules apply immediately without page reload
- **Enable/Disable Rules**: Toggle rules on and off without deleting them
- **Privacy-Focused**: All data stored locally, no external servers

## Installation

### Load the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **"Load unpacked"**
4. Select the `highlight-gmail` directory
5. The extension is now installed!

### Add Icons (Optional but Recommended)

Before loading the extension, you may want to add icon files:

1. Create three PNG images:
   - `icons/icon16.png` (16x16 pixels)
   - `icons/icon48.png` (48x48 pixels)
   - `icons/icon128.png` (128x128 pixels)
2. See `icons/README.md` for more details

The extension will work without icons, but Chrome may show warnings.

## Usage

### Creating Highlight Rules

1. Right-click the extension icon in Chrome's toolbar
2. Select **"Options"** (or go to `chrome://extensions/` → find "Gmail Row Highlighter" → click "Options")
3. Fill out the form:
   - **Rule Type**: Choose from:
     - "Sender Contains" - matches sender email or name
     - "Subject Contains" - matches subject line
     - "Sender or Subject Contains" - matches if pattern appears in either field
     - "Label Contains" - matches Gmail labels
   - **Pattern**: Enter the text to match (e.g., `@client.com`, `Contract:`, `NIAID`)
     - **OR Matching**: Use commas to match multiple patterns (e.g., `googledev,GDG,Google Cloud`)
   - **Background Color**: Pick a color for matching emails
4. Click **"Add Rule"**
5. Open Gmail and see your emails highlighted!

### Example Rules

- **Highlight emails from a specific domain:**
  - Type: Sender Contains
  - Pattern: `@client.com`
  - Color: `#FFF7CC` (light yellow)

- **Highlight emails with specific subject keywords:**
  - Type: Subject Contains
  - Pattern: `Contract`
  - Color: `#D6F5D6` (light green)

- **Highlight emails with a specific label:**
  - Type: Label Contains
  - Pattern: `Important`
  - Color: `#FFE6E6` (light red)

- **Highlight emails matching multiple patterns (OR logic):**
  - Type: Sender or Subject Contains
  - Pattern: `googledev,googlecloud@google.com,GDG,Google Developer Program`
  - Color: `#E3F2FD` (light blue)
  - *Matches emails containing any of these terms*

### Managing Rules

- **Edit**: Click the "Edit" button to modify a rule's type, pattern, or color
- **Edit Color**: Click the color swatch next to any rule to quickly change its color
- **Disable/Enable**: Click the "Disable" or "Enable" button next to any rule
- **Delete**: Click the "Delete" button to remove a rule permanently
- Rules are saved automatically - no need to click a "Save" button

## How It Works

- The extension injects a content script into Gmail pages
- It observes the Gmail message list using a MutationObserver
- When new emails load or rules change, it checks each email row against your rules
- The first matching rule applies its background color to the row
- Matching is case-insensitive by default
- **OR Pattern Matching**: Comma-separated patterns are split and checked individually (any match triggers the rule)
- Each comma-separated term is matched as a complete phrase (e.g., "Google Cloud" matches the full phrase, not just "Google")

## Technical Details

- **Manifest Version**: 3
- **Storage**: Uses Chrome's sync storage (rules sync across devices)
- **Permissions**: Only requires `storage` permission
- **Privacy**: All processing happens locally in your browser

## Troubleshooting

### Emails aren't highlighting

1. Make sure you're on `mail.google.com`
2. Check that your rules are enabled (not grayed out)
3. Verify the pattern matches the email content (case-insensitive)
4. Try refreshing the Gmail page

### Rules not saving

1. Check Chrome's storage quota (extensions → Gmail Row Highlighter → Details)
2. Ensure you're not in incognito mode (extensions may be disabled)
3. Check the browser console for errors (F12 → Console)

### Extension not working

1. Reload the extension in `chrome://extensions/`
2. Refresh the Gmail page
3. Check the browser console for error messages

## Development

### Project Structure

```
highlight-gmail/
├── manifest.json          # Extension configuration
├── content-script.js      # Main highlighting logic
├── styles.css             # Highlight styles
├── options.html           # Options page UI
├── options.js             # Options page logic
├── icons/                 # Extension icons
└── README.md              # This file
```

### Building/Testing

1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Refresh your Gmail tab to see changes

## License

This project is open source. Feel free to modify and distribute.

## Future Enhancements

- Regular expression pattern support
- Rule priority/ordering
- Export/import rules as JSON
- Extension popup with quick toggle
- Preset rule templates
- Case-sensitive matching option
- AND logic for multiple patterns (currently supports OR via comma-separated patterns)

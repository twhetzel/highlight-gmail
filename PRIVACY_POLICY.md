# Privacy Policy for Gmail Row Highlighter

**Last Updated:** [Date]

## Overview

Gmail Row Highlighter ("the Extension") is committed to protecting your privacy. This privacy policy explains how the Extension handles data.

## Data Collection and Storage

### What Data is Stored

The Extension stores only the highlight rules you create, including:
- Rule type (sender, subject, label, etc.)
- Pattern text (the text you want to match)
- Background color preferences
- Rule enabled/disabled status

### Where Data is Stored

All data is stored locally in your browser using Chrome's sync storage API. This means:
- Your rules are stored on your device
- If you have Chrome sync enabled, your rules will sync across your devices
- No data is sent to external servers
- No data is transmitted to third parties

### What Data is NOT Collected

The Extension does NOT collect, transmit, or share:
- Your email content
- Email addresses (except those you explicitly enter as patterns)
- Personal information
- Browsing history
- Any analytics or usage data
- Any data sent to external servers

## Permissions

### Storage Permission

The Extension uses Chrome's storage permission to save your highlight rules. This data is stored locally in your browser and synced across your devices if you have Chrome sync enabled.

### Host Permission (mail.google.com)

The Extension requires access to `mail.google.com` to:
- Inject the content script that highlights email rows
- Read email metadata (sender, subject, labels) to match against your rules

**Important:** The Extension only reads email metadata (sender, subject, labels) to apply your highlight rules. It does NOT:
- Read email body content
- Send emails
- Modify emails
- Access any data outside of Gmail

## Data Processing

All data processing happens locally in your browser:
- Rule matching is performed in your browser
- No data is sent to external servers
- No third-party services are used
- No analytics or tracking is performed

## Third-Party Services

The Extension does not use any third-party services, analytics tools, or external APIs.

## Data Sharing

The Extension does not share any data with third parties. Your rules are stored locally and are never transmitted outside your browser.

## Your Rights

You have full control over your data:
- You can view all your rules in the Extension's options page
- You can edit or delete any rule at any time
- You can disable or uninstall the Extension, which will remove all stored rules
- All data is stored locally and can be cleared by clearing Chrome's extension storage

## Changes to This Privacy Policy

We may update this privacy policy from time to time. The "Last Updated" date at the top of this policy will reflect the most recent changes.

## Contact

If you have questions about this privacy policy, please open an issue on the Extension's GitHub repository.

## Open Source

This Extension is open source. You can review the source code to verify how data is handled.

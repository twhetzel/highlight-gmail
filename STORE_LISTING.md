# Chrome Web Store Listing Information

This file contains all the information needed for the Chrome Web Store listing. Use this as a reference when creating or updating the extension's store listing.

## Basic Information

### Name
**Gmail Row Highlighter**

### Short Description (132 characters max)
```
Highlight Gmail message rows based on sender, subject, or label criteria with custom colors. Privacy-focused, all data stored locally.
```

### Category
**Productivity**

### Language
**English (United States)**

## Detailed Description

Use the following description in the Chrome Web Store listing:

```
Highlight Gmail message rows based on user-defined rules. You can highlight emails by sender, subject, or label criteria with custom background colors.

KEY FEATURES:

✨ Flexible Rule Matching
Create rules to match emails by:
• Sender (email address or name)
• Subject line
• Sender or Subject (matches if pattern appears in either field)
• Gmail labels

🔍 OR Pattern Matching
Use comma-separated patterns for OR logic (e.g., "googledev,GDG,Google Cloud" matches any of these terms)

🎨 Custom Colors
Choose any background color for each rule to visually organize your inbox

⚙️ Easy Management
• Edit rules: Modify rule type, pattern, or color after creation
• Quick color changes: Click any color swatch to quickly change a rule's color
• Enable/Disable: Toggle rules on and off without deleting them
• Real-time updates: Rules apply immediately without page reload

🔒 Privacy-Focused
All data stored locally in your browser. No external servers, no data collection, no tracking.

HOW TO USE:

1. Right-click the extension icon and select "Options"
2. Create a rule by selecting:
   - Rule Type (Sender, Subject, Sender or Subject, or Label)
   - Pattern to match (supports comma-separated OR patterns)
   - Background color
3. Click "Add Rule"
4. Open Gmail and see your emails highlighted!

EXAMPLE RULES:

• Highlight emails from a specific domain:
  Type: Sender Contains | Pattern: @client.com

• Highlight emails with specific subject keywords:
  Type: Subject Contains | Pattern: Contract

• Highlight emails with a specific label:
  Type: Label Contains | Pattern: Important

• Highlight emails matching multiple patterns:
  Type: Sender or Subject Contains | Pattern: googledev,GDG,Google Cloud

TECHNICAL DETAILS:

• Manifest Version 3
• Uses Chrome's sync storage (rules sync across devices)
• Only requires storage permission
• All processing happens locally in your browser
• Case-insensitive matching by default

Perfect for organizing your inbox, prioritizing important emails, and quickly identifying messages from specific senders or topics.
```

## Promotional Images

### Small Promotional Tile (440x280 pixels)
**Location:** `store-assets/promotional-small.png`
**Description:** Small promotional image shown in the Chrome Web Store. Should showcase the extension's main feature (highlighted Gmail rows).

### Large Promotional Tile (920x680 pixels)
**Location:** `store-assets/promotional-large.png`
**Description:** Large promotional image shown on the extension's store page. Should include:
- Extension name
- Key features
- Visual example of highlighted Gmail rows

### Marquee Promotional Tile (1400x560 pixels)
**Location:** `store-assets/promotional-marquee.png`
**Description:** Optional marquee image for featured placement. Should be visually striking and highlight the main value proposition.

## Screenshots

### Screenshot 1 (1280x800 or 640x400 pixels)
**Location:** `store-assets/screenshot-1.png`
**Description:** Main screenshot showing Gmail inbox with highlighted rows in different colors. Should demonstrate the core functionality.

### Screenshot 2 (1280x800 or 640x400 pixels)
**Location:** `store-assets/screenshot-2.png`
**Description:** Options page showing the rule creation interface. Should show the form with example rules.

### Screenshot 3 (1280x800 or 640x400 pixels)
**Location:** `store-assets/screenshot-3.png`
**Description:** (Optional) Close-up of highlighted emails showing different colors and rule types in action.

### Screenshot 4 (1280x800 or 640x400 pixels)
**Location:** `store-assets/screenshot-4.png`
**Description:** (Optional) Example of OR pattern matching with multiple highlighted rows.

**Note:** Chrome Web Store requires at least 1 screenshot, but up to 5 can be uploaded. Recommended: 2-3 screenshots.

## Privacy Policy

**Status:** Created in repository (`PRIVACY_POLICY.md`)

**Action Required:** Host the privacy policy and add the URL to your Chrome Web Store listing.

### Hosting Options

You need to host the privacy policy at a publicly accessible URL. Here are some options:

1. **GitHub Pages** (Recommended for open source projects)
   - Enable GitHub Pages in your repository settings
   - The privacy policy will be available at: `https://twhetzel.github.io/highlight-gmail/PRIVACY_POLICY.md`
   - Or create a `docs/` folder and move it there for a cleaner URL

2. **GitHub Raw URL** (Simple but less ideal)
   - Use the raw file URL: `https://raw.githubusercontent.com/twhetzel/highlight-gmail/main/PRIVACY_POLICY.md`
   - Note: This shows the raw markdown, not a formatted page

3. **Simple Website**
   - Host on any web hosting service
   - Convert markdown to HTML if desired

4. **Privacy Policy Generator**
   - Use a service like [Privacy Policy Generator](https://www.privacypolicygenerator.info/)
   - Host the generated HTML page

**Privacy Policy URL:** (Add your hosted URL here)
```
https://twhetzel.github.io/highlight-gmail/PRIVACY_POLICY.md
```

**Note:** Chrome Web Store requires a privacy policy URL if your extension uses the storage permission and stores user data. Since this extension stores highlight rules, a privacy policy is recommended.

## Support Information

**Support URL:** (Optional - can link to GitHub issues or support page)
```
mailto:support@t2labs.org
```

**Homepage URL:** (Optional - can link to GitHub repo or project page)
```
https://github.com/twhetzel/highlight-gmail
```

## Additional Store Listing Fields

### Single Purpose
**Yes** - The extension has a single purpose: highlighting Gmail rows based on user-defined rules.

### Content Rating
**Everyone** - No mature content, appropriate for all ages.

### Permissions Justification
**Storage Permission:**
Used to save and sync highlight rules across devices. All data is stored locally in Chrome's sync storage.

**Host Permission (mail.google.com):**
Required to inject the content script that highlights email rows in Gmail.

### Collection of User Data
**No** - The extension does not collect, transmit, or share any user data.

### Offline Capability
**Yes** - The extension works offline once rules are configured, as all processing happens locally.

## Version History Notes

### Version 1.0.1
- Initial release
- Highlight emails by sender, subject, or label
- Custom colors for each rule
- OR pattern matching with comma-separated patterns
- Enable/disable rules
- Real-time updates

## Keywords/Tags (for SEO)

- gmail
- email
- highlight
- productivity
- inbox
- organization
- rules
- filter
- color
- gmail extension
- email management

## Store Listing Checklist

- [ ] Name matches manifest.json
- [ ] Short description is within 132 characters
- [ ] Detailed description is complete and formatted
- [ ] Category selected (Productivity)
- [ ] At least 1 screenshot uploaded (recommended: 2-3)
- [ ] Promotional images created (optional but recommended)
- [ ] Privacy policy URL added (required if collecting data)
- [ ] Support URL added (optional)
- [ ] Homepage URL added (optional)
- [ ] Permissions justified
- [ ] Single purpose declared
- [ ] Content rating set
- [ ] Version history notes added

## Notes

- Keep the detailed description updated when adding new features
- Screenshots should be clear and demonstrate the extension's value
- Promotional images are optional but can improve visibility
- Privacy policy is required if the extension collects any user data (this extension doesn't, but it's good practice to have one)
- Update version history notes with each release

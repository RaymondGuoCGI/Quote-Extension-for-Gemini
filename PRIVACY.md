# Privacy Policy for Quote Extension for Gemini

**Last Updated: January 14, 2026**

## Overview

Quote Extension for Gemini ("the Extension") is committed to protecting your privacy. This privacy policy explains how the Extension handles user data.

## Data Collection

**The Extension does NOT collect, store, or transmit any personal data to external servers.**

### What Data is Stored Locally

The Extension only stores the following data locally on your device:

- **Extension Toggle State**: Whether the extension is enabled or disabled for Gemini
  - This data is stored using Chrome's `chrome.storage.local` API
  - This data never leaves your device

### What Data is NOT Collected

The Extension does NOT:

- Collect any personal information
- Track your browsing history
- Store the text you select or quote
- Send any data to external servers
- Use cookies or tracking technologies
- Share data with third parties

## Permissions Explanation

The Extension requires the following permissions to function:

### storage
- **Purpose**: To save your preference for enabling/disabling the extension
- **Usage**: Stores a simple on/off state locally
- **Data Handling**: Data remains on your device only

### clipboardWrite
- **Purpose**: To copy formatted quote text to your clipboard
- **Usage**: Only when you use the quote feature
- **Data Handling**: Text is copied to your system clipboard and not stored by the extension

### host_permissions: https://gemini.google.com/*
- **Purpose**: To allow the extension to work on Google Gemini
- **Usage**: Enables the quote functionality on Gemini
- **Data Handling**: No data is collected or transmitted. The extension only reads selected text when you actively use the quote feature, and this text is processed locally without being stored or transmitted

## Third-Party Services

The Extension does NOT use any third-party services, analytics, or advertising networks.

## Data Security

Since the Extension does not collect or transmit any data, there are no data security concerns related to external storage or transmission.

## Changes to This Privacy Policy

We may update this privacy policy from time to time. Any changes will be posted in the Extension's GitHub repository and updated in the Chrome Web Store listing.

## Open Source

The Extension is open source. You can review the complete source code at:
https://github.com/RaymondGuoCGI/Quote-Extension-for-AI-Chats

## Contact

If you have any questions about this privacy policy, please:
- Open an issue on GitHub: https://github.com/RaymondGuoCGI/Quote-Extension-for-AI-Chats/issues
- Contact the developer through GitHub

## Your Rights

Since the Extension does not collect any personal data, there is no personal data to access, modify, or delete. You can uninstall the Extension at any time through Chrome's extension management page.

---

**Summary**: Quote Extension for Gemini respects your privacy. It does not collect, store, or transmit any personal data. All functionality is performed locally on your device.

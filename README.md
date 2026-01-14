# Quote Extension for Gemini

Quote Extension for Gemini is a Chrome extension that lets you quote selected text and format it directly in Google Gemini chats.

## Features

- One-click quote from selected text
- Auto formatting into clean quote blocks
- Works only on Google Gemini (`https://gemini.google.com/*`)
- Local-only processing (no data is sent to servers)

## How to use

1. Open Google Gemini in Chrome.
2. Select any text on the page.
3. Click the "Quote" button that appears.
4. Type your question or comment and send.

## Permissions

- `storage`: saves your enable/disable toggle locally
- `clipboardWrite`: copies formatted text to your clipboard when you use the quote feature
- `host_permissions`: `https://gemini.google.com/*`

## Development

1. Open `chrome://extensions/`.
2. Enable Developer mode.
3. Click "Load unpacked" and select this folder.

## License

MIT License

# Simple Video Downloader

A Chrome extension that allows you to download videos from webpages.

## Features

- Detects videos on any webpage
- Supports direct video sources (MP4, WebM, etc.)
- Detects HLS (m3u8) streams
- Shows quality information when available
- Identifies embedded videos from YouTube, Vimeo, etc.
- Simple, clean interface

## Installation

### From Chrome Web Store (Coming Soon)

1. Visit the Chrome Web Store
2. Search for "Simple Video Downloader"
3. Click "Add to Chrome"

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension folder
5. The extension should now appear in your toolbar

## How to Use

1. Navigate to a webpage containing videos
2. Click the extension icon in your toolbar
3. The extension will scan the page for videos
4. Click the "Download" button next to any video you want to save
5. For embedded videos (YouTube, Vimeo, etc.), you'll be redirected to the source

## Privacy & Permissions

This extension requires the following permissions:
- **activeTab**: To access the content of your current tab
- **downloads**: To download videos to your computer
- **scripting**: To inject content scripts
- **storage**: To save user preferences
- **host permissions**: To access video content across websites

This extension does NOT:
- Collect any personal data
- Send any information to external servers
- Modify webpage content other than to detect videos

## Technical Details

The extension works by:
1. Scanning the DOM for `<video>` and `<source>` elements
2. Identifying iframe-embedded players
3. Searching page content for common video formats and HLS streams
4. Providing direct download links when possible

## Limitations

- Cannot download DRM-protected content
- YouTube, Vimeo, and some other platforms may not allow direct downloads due to their terms of service
- Some websites use complex video delivery mechanisms that may not be detected

## Contributing

If you'd like to contribute to the development of this extension, please feel free to submit pull requests or open issues on GitHub.

## License

MIT License - See LICENSE file for details

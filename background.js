// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'downloadVideo') {
    // Check if the URL is valid
    if (!message.url || !message.url.startsWith('http')) {
      console.error('Invalid URL:', message.url);
      return;
    }
    
    // Determine filename and options
    const filename = message.filename || getDefaultFilename(message.url);
    
    // Start the download
    chrome.downloads.download({
      url: message.url,
      filename: filename,
      saveAs: true
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('Download error:', chrome.runtime.lastError);
        
        // If there was an error, try with a simpler filename
        if (message.filename) {
          const simpleFilename = 'video' + getFileExtension(message.url);
          chrome.downloads.download({
            url: message.url,
            filename: simpleFilename,
            saveAs: true
          });
        }
      }
    });
  }
});

// Helper function to get a default filename from URL
function getDefaultFilename(url) {
  try {
    // Try to extract filename from URL
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    
    // If filename has a valid extension, use it
    if (filename.match(/\.(mp4|webm|ogg|m4v|mov|flv|wmv|m3u8|ts)$/i)) {
      return filename;
    }
  } catch (e) {
    // Invalid URL, continue with default
  }
  
  // Default filename with extension based on URL
  return 'video' + getFileExtension(url);
}

// Helper function to determine file extension based on URL
function getFileExtension(url) {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('.mp4')) return '.mp4';
  if (lowerUrl.includes('.webm')) return '.webm';
  if (lowerUrl.includes('.ogg')) return '.ogg';
  if (lowerUrl.includes('.m4v')) return '.m4v';
  if (lowerUrl.includes('.mov')) return '.mov';
  if (lowerUrl.includes('.flv')) return '.flv';
  if (lowerUrl.includes('.wmv')) return '.wmv';
  if (lowerUrl.includes('.m3u8')) return '.m3u8';
  if (lowerUrl.includes('.ts')) return '.ts';
  
  // Default extension
  return '.mp4';
}

// Add listener for when extension is installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // When the extension is first installed
    chrome.tabs.create({
      url: 'https://github.com/yourusername/video-downloader/blob/main/README.md'
    });
  }
});
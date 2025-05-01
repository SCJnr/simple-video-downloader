// content.js
(function() {
    // Store detected video sources
    let videoSources = [];
    
    // Function to extract video sources from the page
    function extractVideoSources() {
      videoSources = [];
      
      // Method 1: Find video elements
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach((video, index) => {
        if (video.src && video.src.startsWith('http')) {
          const isHls = window.hlsHelper && window.hlsHelper.isHlsStream(video.src);
          videoSources.push({
            type: isHls ? 'hls' : 'direct',
            url: video.src,
            quality: getVideoQuality(video),
            label: `Video ${index + 1} (${formatBytes(getVideoSize(video))})`
          });
        }
        
        // Check for source elements inside video
        const sources = video.querySelectorAll('source');
        sources.forEach(source => {
          if (source.src && source.src.startsWith('http')) {
            const isHls = window.hlsHelper && window.hlsHelper.isHlsStream(source.src);
            videoSources.push({
              type: isHls ? 'hls' : 'direct',
              url: source.src,
              quality: source.getAttribute('size') || source.getAttribute('label') || getVideoQuality(video),
              label: `Video ${index + 1} - ${source.getAttribute('size') || source.getAttribute('label') || 'Source'}`
            });
          }
        });
      });
      
      // Method 2: Find video URLs in other elements (like iframes)
      findVideoUrlsInElements();
      
      // Method 3: Look for HLS (m3u8) streams
      findHLSStreams();
      
      // Method 4: Look for common video patterns in the page
      findCommonVideoPatterns();
      
      // Return the results
      return videoSources;
    }
    
    // Helper function to find video URLs in other elements
    function findVideoUrlsInElements() {
      // Look for iframes that might contain videos
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((iframe, index) => {
        if (iframe.src && (
            iframe.src.includes('youtube.com/embed/') || 
            iframe.src.includes('vimeo.com/') ||
            iframe.src.includes('dailymotion.com/embed/') ||
            iframe.src.includes('player'))) {
          videoSources.push({
            type: 'iframe',
            url: iframe.src,
            quality: 'Embedded Player',
            label: `Embedded Video ${index + 1} (${new URL(iframe.src).hostname})`
          });
        }
      });
      
      // Look for video links
      const videoLinks = document.querySelectorAll('a[href*=".mp4"], a[href*=".webm"], a[href*=".ogg"], a[href*=".m4v"]');
      videoLinks.forEach((link, index) => {
        if (link.href && link.href.startsWith('http')) {
          videoSources.push({
            type: 'direct',
            url: link.href,
            quality: 'Unknown',
            label: `Video Link ${index + 1} (${link.textContent.substring(0, 30)}...)`
          });
        }
      });
    }
    
    // Function to find HLS streams
    function findHLSStreams() {
      // Look for m3u8 URLs in scripts and other elements
      const pageContent = document.documentElement.innerHTML;
      const m3u8Regex = /https?:\/\/[^\s"']+\.m3u8[^\s"']*/g;
      const m3u8Matches = pageContent.match(m3u8Regex);
      
      if (m3u8Matches) {
        m3u8Matches.forEach((url, index) => {
          if (!videoSources.some(src => src.url === url)) {
            videoSources.push({
              type: 'hls',
              url: url,
              quality: 'HLS Stream',
              label: `HLS Stream ${index + 1}`
            });
          }
        });
      }
    }
    
    // Function to find common video patterns in the page
    function findCommonVideoPatterns() {
      // Look for JSON data in scripts that might contain video information
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => {
        const content = script.textContent;
        
        // Look for video URLs in JSON data
        if (content.includes('"url"') && (content.includes('.mp4') || content.includes('.webm'))) {
          try {
            // Try to extract JSON objects from the script content
            const jsonMatches = content.match(/(\{.*?\})/g);
            if (jsonMatches) {
              jsonMatches.forEach(jsonStr => {
                try {
                  const json = JSON.parse(jsonStr);
                  if (json.url && typeof json.url === 'string' && 
                      (json.url.includes('.mp4') || json.url.includes('.webm') || json.url.includes('.m3u8'))) {
                    const isHls = window.hlsHelper && window.hlsHelper.isHlsStream(json.url);
                    videoSources.push({
                      type: isHls ? 'hls' : 'direct',
                      url: json.url,
                      quality: json.quality || json.label || 'Unknown',
                      label: `JSON Video (${json.quality || json.label || 'Unknown'})`
                    });
                  }
                } catch (e) {
                  // Invalid JSON, ignore this match
                }
              });
            }
          } catch (e) {
            // Error parsing JSON, continue
          }
        }
      });
    }
    
    // Helper to get video quality
    function getVideoQuality(video) {
      if (video.videoWidth && video.videoHeight) {
        return `${video.videoWidth}x${video.videoHeight}`;
      }
      return 'Unknown';
    }
    
    // Helper to estimate video size
    function getVideoSize(video) {
      if (video.videoWidth && video.videoHeight) {
        return video.videoWidth * video.videoHeight;
      }
      return 0;
    }
    
    // Helper to format bytes
    function formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return '0 Bytes';
      
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'getVideoSources') {
        const sources = extractVideoSources();
        sendResponse({ sources: sources });
      }
    });
    
    // Initial scan when page loads
    extractVideoSources();
  })();
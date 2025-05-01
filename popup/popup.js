// popup.js
document.addEventListener('DOMContentLoaded', function() {
    const loadingElement = document.getElementById('loading');
    const noVideosElement = document.getElementById('no-videos');
    const videosContainerElement = document.getElementById('videos-container');
    const videoCountElement = document.getElementById('video-count');
    const videosListElement = document.getElementById('videos-list');
    const rescanButton = document.getElementById('rescan-button');
    
    // Function to scan the page for videos
    function scanForVideos() {
      // Reset UI
      loadingElement.style.display = 'block';
      noVideosElement.style.display = 'none';
      videosContainerElement.style.display = 'none';
      videosListElement.innerHTML = '';
      
      // Get the active tab
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const activeTab = tabs[0];
        
        // Send message to content script to get video sources
        chrome.tabs.sendMessage(activeTab.id, {action: 'getVideoSources'}, function(response) {
          loadingElement.style.display = 'none';
          
          if (response && response.sources && response.sources.length > 0) {
            // Display video list
            videosContainerElement.style.display = 'block';
            videoCountElement.textContent = response.sources.length;
            displayVideoList(response.sources, activeTab);
          } else {
            // Display no videos message
            noVideosElement.style.display = 'block';
          }
        });
      });
    }
    
    // Function to display the list of videos
    function displayVideoList(sources, tab) {
      // Group sources by type
      const directSources = sources.filter(source => source.type === 'direct');
      const hlsSources = sources.filter(source => source.type === 'hls');
      const iframeSources = sources.filter(source => source.type === 'iframe');
      
      // Display direct video sources first
      displaySourceGroup(directSources, 'Direct Videos', tab);
      
      // Display HLS streams
      displaySourceGroup(hlsSources, 'HLS Streams', tab);
      
      // Display embedded videos
      displaySourceGroup(iframeSources, 'Embedded Videos', tab);
    }
    
    // Helper function to display a group of sources
    function displaySourceGroup(sources, groupTitle, tab) {
      if (sources.length === 0) return;
      
      // Create group header
      const groupHeader = document.createElement('h3');
      groupHeader.textContent = groupTitle;
      groupHeader.className = 'group-header';
      videosListElement.appendChild(groupHeader);
      
      // Add each source in the group
      sources.forEach((source, index) => {
        const videoItemElement = document.createElement('div');
        videoItemElement.className = 'video-item';
        
        // Create video info container
        const videoInfoElement = document.createElement('div');
        videoInfoElement.className = 'video-info';
        
        // Add video title
        const videoTitleElement = document.createElement('div');
        videoTitleElement.className = 'video-title';
        videoTitleElement.textContent = source.label || `Video ${index + 1}`;
        videoInfoElement.appendChild(videoTitleElement);
        
        // Add video quality if available
        if (source.quality) {
          const videoQualityElement = document.createElement('div');
          videoQualityElement.className = 'video-quality';
          videoQualityElement.textContent = `Quality: ${source.quality}`;
          videoInfoElement.appendChild(videoQualityElement);
        }
        
        // Add download button
        const downloadButton = document.createElement('button');
        downloadButton.className = 'download-button';
        downloadButton.innerHTML = '<svg class="download-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>Download';
        
        // Add click event to download button
        downloadButton.addEventListener('click', () => {
          handleDownload(source, tab, index);
        });
        
        // Add elements to video item
        videoItemElement.appendChild(videoInfoElement);
        videoItemElement.appendChild(downloadButton);
        
        // Add video item to the list
        videosListElement.appendChild(videoItemElement);
      });
    }
    
    // Function to handle downloads based on source type
    function handleDownload(source, tab, index) {
      // Generate filename based on page title and video index
      const filename = `${sanitizeFilename(tab.title)}_video${index + 1}${getFileExtension(source)}`;
      
      if (source.type === 'direct') {
        // For direct video sources, download directly
        chrome.runtime.sendMessage({
          action: 'downloadVideo',
          url: source.url,
          filename: filename
        });
      } else if (source.type === 'hls') {
        // For HLS streams, we need to inform the user
        const confirmed = confirm(
          'HLS streams (.m3u8) may not download properly as a single file.\n\n' +
          'Click OK to attempt download anyway, or Cancel to copy the URL to clipboard.'
        );
        
        if (confirmed) {
          chrome.runtime.sendMessage({
            action: 'downloadVideo',
            url: source.url,
            filename: filename
          });
        } else {
          // Copy URL to clipboard
          navigator.clipboard.writeText(source.url).then(() => {
            alert('HLS stream URL copied to clipboard. You can use a dedicated HLS downloader tool.');
          });
        }
      } else if (source.type === 'iframe') {
        // For iframes, open the source in a new tab
        chrome.tabs.create({url: source.url});
      }
    }
    
    // Helper function to determine file extension based on source
    function getFileExtension(source) {
      if (source.type === 'hls') {
        return '.m3u8';
      }
      
      if (source.url) {
        const url = source.url.toLowerCase();
        if (url.includes('.mp4')) return '.mp4';
        if (url.includes('.webm')) return '.webm';
        if (url.includes('.ogg')) return '.ogg';
        if (url.includes('.m4v')) return '.m4v';
      }
      
      return '.mp4'; // Default extension
    }
    
    // Helper function to sanitize filenames
    function sanitizeFilename(name) {
      return name.replace(/[\\/:*?"<>|]/g, '_').substring(0, 50);
    }
    
    // Add click event to rescan button
    rescanButton.addEventListener('click', scanForVideos);
    
    // Add event listener for keyboard shortcut to refresh
    document.addEventListener('keydown', (e) => {
      if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        scanForVideos();
      }
    });
    
    // Initial scan
    scanForVideos();
  });
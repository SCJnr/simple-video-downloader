// options.js
document.addEventListener('DOMContentLoaded', function() {
    // Default settings
    const defaultSettings = {
      defaultFilenameFormat: '{title}_{index}',
      alwaysSaveAs: true,
      detectHls: true,
      detectEmbeds: true,
      detectLinks: true,
      maxVideos: 20,
      autoScan: true
    };
    
    // Get DOM elements
    const defaultFilenameInput = document.getElementById('default-filename');
    const alwaysSaveAsCheckbox = document.getElementById('always-save-as');
    const detectHlsCheckbox = document.getElementById('detect-hls');
    const detectEmbedsCheckbox = document.getElementById('detect-embeds');
    const detectLinksCheckbox = document.getElementById('detect-links');
    const maxVideosInput = document.getElementById('max-videos');
    const autoScanCheckbox = document.getElementById('auto-scan');
    
    const saveButton = document.getElementById('save-button');
    const resetButton = document.getElementById('reset-button');
    const statusDiv = document.getElementById('status');
    
    // Load saved settings
    function loadSettings() {
      chrome.storage.sync.get(defaultSettings, function(settings) {
        defaultFilenameInput.value = settings.defaultFilenameFormat;
        alwaysSaveAsCheckbox.checked = settings.alwaysSaveAs;
        detectHlsCheckbox.checked = settings.detectHls;
        detectEmbedsCheckbox.checked = settings.detectEmbeds;
        detectLinksCheckbox.checked = settings.detectLinks;
        maxVideosInput.value = settings.maxVideos;
        autoScanCheckbox.checked = settings.autoScan;
      });
    }
    
    // Save settings
    function saveSettings() {
      const settings = {
        defaultFilenameFormat: defaultFilenameInput.value,
        alwaysSaveAs: alwaysSaveAsCheckbox.checked,
        detectHls: detectHlsCheckbox.checked,
        detectEmbeds: detectEmbedsCheckbox.checked,
        detectLinks: detectLinksCheckbox.checked,
        maxVideos: parseInt(maxVideosInput.value, 10),
        autoScan: autoScanCheckbox.checked
      };
      
      chrome.storage.sync.set(settings, function() {
        // Show success message
        statusDiv.textContent = 'Options saved!';
        statusDiv.className = 'success';
        
        // Clear status message after 3 seconds
        setTimeout(function() {
          statusDiv.textContent = '';
          statusDiv.className = '';
        }, 3000);
      });
    }
    
    // Reset settings to defaults
    function resetSettings() {
      if (confirm('Are you sure you want to reset all options to their default values?')) {
        chrome.storage.sync.set(defaultSettings, function() {
          loadSettings();
          
          // Show success message
          statusDiv.textContent = 'Options reset to defaults!';
          statusDiv.className = 'success';
          
          // Clear status message after 3 seconds
          setTimeout(function() {
            statusDiv.textContent = '';
            statusDiv.className = '';
          }, 3000);
        });
      }
    }
    
    // Event listeners
    saveButton.addEventListener('click', saveSettings);
    resetButton.addEventListener('click', resetSettings);
    
    // Load settings when page loads
    loadSettings();
  });
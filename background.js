// Listen for the command defined in manifest.json
chrome.commands.onCommand.addListener(command => {
  console.log(`Command received: ${command}`); // Log to background console for debugging

  // Check if the command name matches the one we defined
  if (command === 'show_alert_command') {
    // Find the currently active tab in the current window
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      // Ensure we found an active tab
      if (tabs && tabs.length > 0) {
        const activeTabId = tabs[0].id;

        // Execute a script in the context of the active tab
        chrome.scripting.executeScript({
          target: { tabId: activeTabId }, // Target the active tab
          func: showAlert, // Specify the function to execute
        });
      } else {
        console.error('Could not find active tab.');
      }
    });
  }
});

// This function will be injected and executed on the active page
function showAlert() {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  alert(`Current time: ${hours}:${minutes}`);
}

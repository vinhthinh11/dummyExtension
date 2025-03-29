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
        // chrome.action.openPopup();
        chrome.scripting
          .insertCSS({
            target: { tabId: activeTabId },
            files: ['clock.css'], // Create this file with the styles from clock.html
          })
          .then(() => {
            // Then execute script to insert and control the modal
            chrome.scripting.executeScript({
              target: { tabId: activeTabId },
              func: injectClockModal,
            });
          })
          .catch(err => console.error('Error injecting CSS:', err));
      } else {
        console.error('No active tab found');
      }
    });
  }
});

function injectClockModal() {
  // Check if modal already exists - don't create multiple instances
  if (document.getElementById('clockOverlay')) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'clockOverlay';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'clockModal';

  const clock = document.createElement('div');
  clock.className = 'clock';
  clock.id = 'clock';

  const date = document.createElement('div');
  date.className = 'date';
  date.id = 'date';

  // Assemble modal
  modal.appendChild(clock);
  modal.appendChild(date);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Update clock function
  function updateClock() {
    const now = new Date();

    // Update time
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clock.textContent = `${hours}:${minutes}:${seconds}`;

    // Update date
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    date.textContent = now.toLocaleDateString(undefined, options);
  }

  // Close modal function
  function closeModal() {
    modal.classList.add('closing');
    overlay.classList.add('closing');
    setTimeout(() => {
      document.body.removeChild(overlay);
    }, 500);
  }
  // Add event listeners
  overlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', closeModal);

  // Auto close after 5 seconds
  setTimeout(closeModal, 5000);

  // Initialize and update clock
  updateClock();
  setInterval(updateClock, 1000);
}

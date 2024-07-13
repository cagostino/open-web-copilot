
function extractText() {
  const textElements = document.querySelectorAll('g[data-section-type="body"][role="paragraph"] rect[aria-label]');
  let extractedText = '';
  textElements.forEach(element => {
    extractedText += element.getAttribute('aria-label') + ' ';
  });
  return extractedText.trim();
}
function createSuggestionBox() {
    const suggestionBox = document.createElement('div');
    suggestionBox.id = 'suggestion-box';
    suggestionBox.style.cssText = `
      position: absolute;
      background-color: #f9f9f9;
      border: 1px solid #ccc;
      padding: 5px;
      z-index: 10000; // Ensure it appears on top
      display: none; // Initially hidden
      font-family: Arial, sans-serif; // Match Google Docs font
      font-size: 14px; // Adjust as needed
    `;
    document.body.appendChild(suggestionBox);
    return suggestionBox;
  }
function handleTextChanges() {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping, doneTypingInterval);
}
  
  
const suggestionBox = createSuggestionBox(); 
  
function positionSuggestionBox(suggestionText) {
    const inputArea = document.querySelector('.kix-cursor-caret'); // Get the cursor element
  
    if (inputArea) {
      const rect = inputArea.getBoundingClientRect();
      const suggestionBoxRect = suggestionBox.getBoundingClientRect();
  
      suggestionBox.innerText = suggestionText;
  
      // Calculate position above the cursor
      let top = rect.top - suggestionBoxRect.height - 5; // 5px spacing
      let left = rect.left;
  
      // Adjust position if the box goes offscreen (left side)
      if (left < 0) {
        left = 0;
      }
  
      // Adjust position if the box goes offscreen (top)
      if (top < 0) {
        top = rect.bottom + 5; // Position below if above is cut off
      }
  
      suggestionBox.style.top = top + 'px';
      suggestionBox.style.left = left + 'px';
      suggestionBox.style.display = 'block';
    } else {
      // Handle cases where the cursor element is not found
      suggestionBox.style.display = 'none';
      console.log("Cursor element not found. Suggestion box hidden.");
    }
  }
  

let typingTimer;
const doneTypingInterval = 1000; // 1 second
let previousText = "";
function insertSuggestion() {
    if (suggestionBox.style.display === 'block') {
      const suggestionText = suggestionBox.innerText;
      suggestionBox.style.display = 'none';
  
      // Copy suggestion text to clipboard
      navigator.clipboard.writeText(suggestionText)
        .then(() => {
          console.log('Text copied to clipboard');
  
          // Simulate Ctrl+V (Paste)
          const keyboardEvent = new KeyboardEvent('keydown', {
            key: 'v',
            ctrlKey: true,
            bubbles: true 
          });
          document.dispatchEvent(keyboardEvent);
  
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    }
  }
function doneTyping() {
    const currentText = extractText();
  
    if (currentText !== previousText) {
      const newText = currentText.substring(previousText.length); // Get only the new text
      console.log("New text detected:", newText);
  
      fetch('http://localhost:3333/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: newText }) // Send only the new text
      })
      .then(response => response.json())
      .then(data => {
        console.log('Suggestion from server:', data.generatedText);
        suggestionBox.innerText = data.generatedText;
        suggestionBox.style.display = 'block'; // Show the box
        requestAnimationFrame(() => {
            positionSuggestionBox(data.generatedText); 
          });
    
    
        // ... your logic to display suggestions ...
      })
      .catch(error => console.error('Error fetching suggestion:', error));
  
      previousText = currentText;
    }
  }
  // Function to handle both key events and mutations
function handleTextChanges() {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping, doneTypingInterval);
  }
  const delay = 5000; // Wait for 5 seconds (adjust as needed)

setTimeout(initializeKeyHandler, delay); 

function initializeKeyHandler() {
    // 1. Target the MOST LIKELY Google Docs editing areas (adjust selectors if needed)
    const potentialEditors = [
      '.kix-editor-content', // Common Google Docs content area
      '.docs-texteventtarget-iframe', // Potential iframe for editing
      // Add more selectors based on your inspection of Google Docs
    ];
  
    potentialEditors.forEach(selector => {
      const editorElement = document.querySelector(selector);
      if (editorElement) {
        console.log("Found potential editor:", selector);
        editorElement.addEventListener('keydown', (event) => {
          console.log("Key pressed:", event.key, event.altKey);
          if (event.altKey && event.key === 'Enter') {
            console.log("Alt+Enter CAPTURED!");
            event.preventDefault(); // Stop Google Docs from handling it
            event.stopPropagation(); // Prevent bubbling to parent elements 
            setTimeout(() => {
              insertSuggestion();
            }, 0);
          }
        });
      } else {
        console.log("Editor not found:", selector);
      }
    });
  }
// Event listener for keyboard events
document.addEventListener('keyup', handleTextChanges);
document.addEventListener('keydown', (event) => {
    console.log("Key pressed:", event.key, event.altKey); // Log all key presses
    // Check for "Alt+Enter" (or your chosen shortcut)
    if (event.altKey && event.key === 'Enter') {
      console.log("Alt+Enter detected!"); // Log when Alt+Enter is pressed
      event.preventDefault();
  
      // Ensure insertSuggestion is called in the next event loop cycle
      setTimeout(() => {
        insertSuggestion();
      }, 0); 
    } else {
      // Handle all other key presses for suggestions
      handleTextChanges();
    }
  });
  
// Mutation observer to detect changes from other sources
const observer = new MutationObserver(handleTextChanges);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
});
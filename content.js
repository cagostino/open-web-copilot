function extractText() {
  const textElements = document.querySelectorAll('g[data-section-type="body"][role="paragraph"] rect[aria-label]');
  let extractedText = '';
  textElements.forEach(element => {
    extractedText += element.getAttribute('aria-label') + ' ';
  });
  return extractedText.trim();
}
function createSuggestionBox(suggestionText) {
  const suggestionBox = document.createElement('div');
  suggestionBox.classList.add('suggestion-box');

  suggestionBox.style.cssText = `
    position: absolute;
    background-color: #ffffff;
    border: 2px solid #3498db;
    border-radius: 4px;
    padding: 8px 12px;
    z-index: 10000;
    display: none;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 14px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    max-width: 300px;
    cursor: pointer;
  `;

  const textSpan = document.createElement('span');
  textSpan.textContent = suggestionText;
  textSpan.style.color = '#333333';
  suggestionBox.appendChild(textSpan);

  // Create the X button
  const xButton = document.createElement('span');
  xButton.innerHTML = '&#10005;';  // Unicode for X
  xButton.style.cssText = `
    color: #e74c3c;
    cursor: pointer;
    margin-left: 8px;
    font-size: 16px;
    vertical-align: middle;
    float: right;
  `;
  xButton.addEventListener('click', (event) => {
    event.stopPropagation();  // Prevent the click from triggering the copy action
    hideSuggestionBox();
  });
  suggestionBox.appendChild(xButton);

  // Add click event listener to the entire suggestion box for copying
  // Modify the click event listener
  suggestionBox.addEventListener('click', () => {
    insertTextAtCursor(suggestionText);
    suggestionBox.style.backgroundColor = '#eafaf1';  // Light green to indicate success
    setTimeout(() => {
      hideSuggestionBox();
    }, 500);
  });



  document.body.appendChild(suggestionBox);
  return suggestionBox;
}
function insertTextAtCursor(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      console.log('Text copied to clipboard:', text);
      setTimeout(simulateClick, 50);  // 50ms delay, adjust if needed
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
    });
}
function simulateClick() {
  const editorArea = document.querySelector('.kix-appview-editor');
  
  if (editorArea) {
    const cursorElement = document.querySelector('.kix-cursor-caret');
    const rect = cursorElement ? cursorElement.getBoundingClientRect() : null;
    
    ['mousedown', 'mouseup', 'click'].forEach(eventType => {
      const clickEvent = new MouseEvent(eventType, {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: rect ? rect.left : 0,
        clientY: rect ? rect.top : 0
      });
      editorArea.dispatchEvent(clickEvent);
    });
    
    console.log('Click simulated to free cursor');
  } else {
    console.error('Editor area not found for simulating click');
  }
}


function hideSuggestionBox() {
  if (previousSuggestionBox) {
    previousSuggestionBox.style.display = 'none';
    previousSuggestionBox.remove();
    previousSuggestionBox = null;
  }
}

function positionSuggestionBox(suggestionBox) {
  const inputArea = document.querySelector('.kix-cursor-caret');

  if (inputArea) {
    const rect = inputArea.getBoundingClientRect();
    const suggestionBoxRect = suggestionBox.getBoundingClientRect();

    let top = rect.top - suggestionBoxRect.height + 20;
    let left = rect.left + 30;  // Offset to the right by 20 pixels

    if (left + suggestionBoxRect.width > window.innerWidth) {
      left = window.innerWidth - suggestionBoxRect.width - 10;
    }
    if (top < 0) top = rect.bottom + 10;

    suggestionBox.style.top = `${top}px`;
    suggestionBox.style.left = `${left}px`;
    suggestionBox.style.display = 'block';
  } else {
    suggestionBox.style.display = 'none';
    console.log("Cursor element not found. Suggestion box hidden.");
  }
}

let typingTimer;
const doneTypingInterval = 1000; 
let previousText = "";
let previousSuggestionBox = null;
let isTyping = false;

function doneTyping() {
  isTyping = false;
  const currentText = extractText();

  if (currentText !== previousText) {
    const newText = currentText.substring(previousText.length);
    console.log("New text detected:", newText);

    fetch('http://localhost:3333/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context: newText })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Suggestion from server:', data.generatedText);

      hideSuggestionBox();
      const suggestionBox = createSuggestionBox(data.generatedText);
      positionSuggestionBox(suggestionBox);

      previousSuggestionBox = suggestionBox;
    })
    .catch(error => console.error('Error fetching suggestion:', error));

    previousText = currentText;
  } else {
    console.log("No new text detected. Skipping suggestion request.");
  }
}

function handleTextChanges() {
  const currentText = extractText();
  if (currentText !== previousText) {
    if (!isTyping) {
      isTyping = true;
      hideSuggestionBox();
    }
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping, doneTypingInterval);
  }
}

function repositionSuggestionBoxOnScroll() {
  if (previousSuggestionBox) {
    hideSuggestionBox();
  }
}

const delay = 5000; 

setTimeout(initializeKeyHandler, delay); 

function initializeKeyHandler() {
  const potentialEditors = [
    '.kix-editor-content', 
    '.docs-texteventtarget-iframe', 
  ];

  potentialEditors.forEach(selector => {
    const editorElement = document.querySelector(selector);
    if (editorElement) {
      console.log("Found potential editor:", selector);
      editorElement.addEventListener('keydown', (event) => {
        console.log("Key pressed:", event.key, event.altKey);
        if (event.altKey && event.key === 'Enter') {
          console.log("Alt+Enter CAPTURED!");
          event.preventDefault(); 
          event.stopPropagation();  
        }
      });
    } else {
      console.log("Editor not found:", selector);
    }
  });
}

window.addEventListener('scroll', repositionSuggestionBoxOnScroll);
function attachScrollListener() {
  const editorElement = document.querySelector('.kix-appview-editor');
  if (editorElement) {
    editorElement.addEventListener('scroll', repositionSuggestionBoxOnScroll);
  }
}

// Call this function after a short delay to ensure the editor is loaded
setTimeout(attachScrollListener, 2000);

// Update the existing event listeners
document.addEventListener('keyup', handleTextChanges);
document.addEventListener('keydown', (event) => {
  if (event.altKey && event.key === 'Enter') {
    console.log("Alt+Enter detected!"); 
    event.preventDefault();
  } else if (!event.altKey) {
    handleTextChanges();
  }
});

const observer = new MutationObserver(handleTextChanges);
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  characterData: true,
});
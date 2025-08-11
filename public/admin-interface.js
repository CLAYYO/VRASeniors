// Store original content for reset functionality
let originalContent = [];
let currentContent = [];

// Initialize the admin interface
document.addEventListener('DOMContentLoaded', function() {
  initializeContent();
  setupEventListeners();
  setupRichTextEditor();
});

function decodeHtmlEntities(text) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function initializeContent() {
  // Use the content data passed from the server
  if (!window.adminContentData) {
    console.error('Admin content data not found');
    return;
  }
  
  const contentItems = document.querySelectorAll('.content-item');
  originalContent = [];
  currentContent = [];
  
  contentItems.forEach((item, index) => {
    const titleInput = item.querySelector('.title-input');
    const contentEditor = item.querySelector('.content-editor');
    const pdfInputs = item.querySelectorAll('.pdf-name-input');
    const pdfFilenameInputs = item.querySelectorAll('.pdf-filename-input');
    
    // Get the original content from the server data
    const serverData = window.adminContentData[index];
    if (!serverData) {
      console.warn(`No server data found for item ${index}`);
      return;
    }
    
    const originalHtmlContent = serverData.content || '';
    
    // The content should already be properly rendered by set:html directive
    // Don't override it with JavaScript to avoid conflicts
    
    const itemData = {
      page: serverData.page,
      title: serverData.title,
      content: originalHtmlContent,
      pdfs: serverData.pdfs || []
    };
    
    originalContent.push(JSON.stringify(itemData));
    currentContent.push(JSON.stringify(itemData));
  });
}

function setupEventListeners() {
  // Section filter
  const sectionFilter = document.getElementById('section-filter');
  if (sectionFilter) {
    sectionFilter.addEventListener('change', filterContent);
  }
  
  // Main controls
  const saveAllBtn = document.getElementById('save-all-btn');
  const exportBtn = document.getElementById('export-json-btn');
  const resetBtn = document.getElementById('reset-btn');
  const importBtn = document.getElementById('import-btn');
  const importInput = document.getElementById('import-json');
  
  if (saveAllBtn) saveAllBtn.addEventListener('click', saveAllChanges);
  if (exportBtn) exportBtn.addEventListener('click', exportJSON);
  if (resetBtn) resetBtn.addEventListener('click', resetAll);
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      if (importInput) importInput.click();
    });
  }
  if (importInput) importInput.addEventListener('change', importJSON);

  // Individual item controls
  document.querySelectorAll('.save-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      if (index !== undefined) saveItem(index);
    });
  });
  
  document.querySelectorAll('.reset-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      if (index !== undefined) resetItem(index);
    });
  });

  // PDF management
  document.querySelectorAll('.add-pdf-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      if (index !== undefined) addPDF(index);
    });
  });
  
  document.querySelectorAll('.remove-pdf-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      const pdfIndex = e.target.dataset.pdfIndex;
      if (index !== undefined && pdfIndex !== undefined) {
        removePDF(index, pdfIndex);
      }
    });
  });
}

function setupRichTextEditor() {
  const editors = document.querySelectorAll('.content-editor');
  const toolbar = document.getElementById('editor-toolbar');
  
  if (!toolbar) return;
  
  editors.forEach(editor => {
    editor.addEventListener('focus', () => {
      toolbar.classList.remove('hidden');
    });
    
    editor.addEventListener('blur', () => {
      setTimeout(() => {
        if (!toolbar.contains(document.activeElement)) {
          toolbar.classList.add('hidden');
        }
      }, 100);
    });
  });

  // Toolbar buttons
  document.querySelectorAll('.toolbar-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const command = btn.dataset.command;
      const value = btn.dataset.value;
      
      if (command === 'createLink') {
        const url = prompt('Enter URL:');
        if (url) {
          document.execCommand(command, false, url);
        }
      } else if (value) {
        document.execCommand(command, false, value);
      } else {
        document.execCommand(command, false, null);
      }
    });
  });
}

function filterContent() {
  const filter = document.getElementById('section-filter');
  if (!filter) return;
  
  const filterValue = filter.value;
  const items = document.querySelectorAll('.content-item');
  
  items.forEach(item => {
    if (!filterValue || item.dataset.section === filterValue) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

function saveItem(index) {
  const item = document.querySelector(`[data-index="${index}"]`);
  if (!item) return;
  
  const titleInput = item.querySelector('.title-input');
  const contentEditor = item.querySelector('.content-editor');
  
  if (!titleInput || !contentEditor) return;
  
  const title = titleInput.value;
  const content = contentEditor.innerHTML;
  
  // Update current content
  const contentObj = JSON.parse(currentContent[index]);
  contentObj.title = title;
  contentObj.content = content;
  
  // Update PDFs
  const pdfNames = item.querySelectorAll('.pdf-name-input');
  const pdfFilenames = item.querySelectorAll('.pdf-filename-input');
  contentObj.pdfs = [];
  
  pdfNames.forEach((nameInput, pdfIndex) => {
    const filenameInput = pdfFilenames[pdfIndex];
    if (nameInput && filenameInput && nameInput.value && filenameInput.value) {
      contentObj.pdfs.push({
        name: nameInput.value,
        filename: filenameInput.value
      });
    }
  });
  
  currentContent[index] = JSON.stringify(contentObj);
  
  // Show success message
  showMessage('Item saved successfully!', 'success');
}

function resetItem(index) {
  if (confirm('Reset this item to original content?')) {
    currentContent[index] = originalContent[index];
    location.reload(); // Simple way to reset the display
  }
}

function saveAllChanges() {
  const contentItems = document.querySelectorAll('.content-item');
  contentItems.forEach((item, index) => {
    saveItem(index);
  });
  showMessage('All changes saved!', 'success');
}

function resetAll() {
  if (confirm('Reset all content to original? This will lose all unsaved changes.')) {
    currentContent = [...originalContent];
    location.reload();
  }
}

function exportJSON() {
  const exportData = currentContent.map(item => JSON.parse(item));
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vra_seniors_site_content.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showMessage('JSON exported successfully!', 'success');
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const result = e.target.result;
      if (typeof result === 'string') {
        const importedData = JSON.parse(result);
        if (confirm('Import this JSON file? This will replace all current content.')) {
          currentContent = importedData.map(item => JSON.stringify(item));
          location.reload();
        }
      }
    } catch (error) {
      showMessage('Error importing JSON: ' + error.message, 'error');
    }
  };
  reader.readAsText(file);
}

function addPDF(index) {
  const item = document.querySelector(`[data-index="${index}"]`);
  if (!item) return;
  
  const pdfContainer = item.querySelector('.pdf-container');
  if (!pdfContainer) return;
  
  const newPdfDiv = document.createElement('div');
  newPdfDiv.className = 'pdf-item flex items-center gap-2 p-2 bg-gray-50 rounded';
  newPdfDiv.innerHTML = `
    <input 
      type="text"
      class="pdf-name-input flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
      placeholder="PDF Name"
      data-index="${index}"
    >
    <input 
      type="text"
      class="pdf-filename-input flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
      placeholder="PDF Filename"
      data-index="${index}"
    >
    <button 
      class="remove-pdf-btn bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
      data-index="${index}"
    >
      Remove
    </button>
  `;
  
  pdfContainer.appendChild(newPdfDiv);
  
  // Add event listener to new remove button
  const removeBtn = newPdfDiv.querySelector('.remove-pdf-btn');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      newPdfDiv.remove();
    });
  }
}

function removePDF(index, pdfIndex) {
  if (confirm('Remove this PDF?')) {
    const pdfItem = document.querySelector(`[data-index="${index}"] [data-pdf-index="${pdfIndex}"]`);
    if (pdfItem) {
      const pdfDiv = pdfItem.closest('.pdf-item');
      if (pdfDiv) {
        pdfDiv.remove();
      }
    }
  }
}

function showMessage(message, type) {
  const messageContainer = document.getElementById('message-container');
  if (!messageContainer) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `p-4 rounded-lg text-white mb-2 ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  }`;
  messageDiv.textContent = message;
  
  messageContainer.appendChild(messageDiv);
  
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.parentNode.removeChild(messageDiv);
    }
  }, 3000);
}
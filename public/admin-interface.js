// Store original content for reset functionality
let originalContent = [];
let currentContent = [];

// Authentication configuration
const ADMIN_PASSWORD = 'VRASeniors2025'; // Change this to your desired password
const AUTH_SESSION_KEY = 'vra_admin_auth';
const AUTH_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

// Initialize the admin interface
document.addEventListener('DOMContentLoaded', function() {
  checkAuthentication();
});

function checkAuthentication() {
  const authData = localStorage.getItem(AUTH_SESSION_KEY);
  
  if (authData) {
    try {
      const { timestamp, authenticated } = JSON.parse(authData);
      const now = Date.now();
      
      // Check if session is still valid (within timeout period)
      if (authenticated && (now - timestamp) < AUTH_TIMEOUT) {
        showAdminInterface();
        return;
      }
    } catch (e) {
      console.warn('Invalid auth data, clearing session');
    }
  }
  
  // Clear any invalid session data
  localStorage.removeItem(AUTH_SESSION_KEY);
  showLoginModal();
}

function showLoginModal() {
  const loginModal = document.getElementById('login-modal');
  const adminContent = document.getElementById('admin-content');
  
  if (loginModal) {
    loginModal.classList.remove('hidden');
    setupLoginForm();
  }
  
  if (adminContent) {
    adminContent.classList.add('hidden');
  }
}

function showAdminInterface() {
  const loginModal = document.getElementById('login-modal');
  const adminContent = document.getElementById('admin-content');
  
  if (loginModal) {
    loginModal.classList.add('hidden');
  }
  
  if (adminContent) {
    adminContent.classList.remove('hidden');
  }
  
  // Initialize admin interface
  initializeContent();
  setupEventListeners();
  setupRichTextEditor();
}

function setupLoginForm() {
  const loginForm = document.getElementById('login-form');
  const passwordInput = document.getElementById('admin-password');
  const errorDiv = document.getElementById('login-error');
  
  if (!loginForm || !passwordInput || !errorDiv) return;
  
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const enteredPassword = passwordInput.value;
    
    if (enteredPassword === ADMIN_PASSWORD) {
      // Store authentication in localStorage with timestamp
      const authData = {
        authenticated: true,
        timestamp: Date.now()
      };
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(authData));
      
      // Show admin interface
      showAdminInterface();
      
      // Clear form
      passwordInput.value = '';
      errorDiv.classList.add('hidden');
    } else {
      // Show error
      errorDiv.classList.remove('hidden');
      passwordInput.value = '';
      passwordInput.focus();
    }
  });
  
  // Focus password input
  passwordInput.focus();
}

function logout() {
  localStorage.removeItem(AUTH_SESSION_KEY);
  showLoginModal();
}

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
    <input 
      type="file"
      class="pdf-file-input border border-gray-300 rounded px-2 py-1 text-sm"
      accept=".pdf"
      data-index="${index}"
    >
    <button 
      class="upload-pdf-btn bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
      data-index="${index}"
    >
      Upload
    </button>
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
  
  // Add event listener to upload button
  const uploadBtn = newPdfDiv.querySelector('.upload-pdf-btn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      const fileInput = newPdfDiv.querySelector('.pdf-file-input');
      if (fileInput && fileInput.files[0]) {
        handleFileUpload(fileInput);
      } else {
        showMessage('Please select a PDF file first', 'error');
      }
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

function handleFileUpload(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;
  
  const formData = new FormData();
  formData.append('pdf', file);
  
  // Show upload progress
  const statusDiv = fileInput.closest('.pdf-item').querySelector('.upload-status') || 
                   fileInput.parentElement.querySelector('.upload-status');
  if (statusDiv) {
    statusDiv.textContent = 'Uploading...';
    statusDiv.className = 'upload-status mt-2 text-sm text-blue-600';
  }
  
  fetch('/api/upload-pdf', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Auto-fill filename if empty
      const filenameInput = fileInput.closest('.pdf-item').querySelector('.pdf-filename-input');
      if (filenameInput && !filenameInput.value) {
        filenameInput.value = data.filename;
      }
      
      if (statusDiv) {
        statusDiv.textContent = 'Upload successful!';
        statusDiv.className = 'upload-status mt-2 text-sm text-green-600';
      }
      showMessage('PDF uploaded successfully!', 'success');
    } else {
      throw new Error(data.error || 'Upload failed');
    }
  })
  .catch(error => {
    if (statusDiv) {
      statusDiv.textContent = 'Upload failed: ' + error.message;
      statusDiv.className = 'upload-status mt-2 text-sm text-red-600';
    }
    showMessage('Upload failed: ' + error.message, 'error');
  });
}

function commitAndPush() {
  if (!confirm('Commit and push all changes to GitHub? This will make your changes live.')) {
    return;
  }
  
  const commitBtn = document.querySelector('.commit-push-btn');
  if (commitBtn) {
    commitBtn.disabled = true;
    commitBtn.textContent = 'Committing...';
  }
  
  fetch('/api/commit-push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Update content via admin interface'
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showMessage('Changes committed and pushed successfully!', 'success');
    } else {
      throw new Error(data.error || 'Commit failed');
    }
  })
  .catch(error => {
    showMessage('Commit failed: ' + error.message, 'error');
  })
  .finally(() => {
    if (commitBtn) {
      commitBtn.disabled = false;
      commitBtn.textContent = 'Commit & Push to GitHub';
    }
  });
}
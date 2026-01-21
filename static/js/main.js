// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadSection = document.getElementById('uploadSection');
const progressContainer = document.getElementById('progressContainer');
const progressText = document.getElementById('progressText');
const resultsSection = document.getElementById('resultsSection');
const extractedText = document.getElementById('extractedText');
const wordCount = document.getElementById('wordCount');
const charCount = document.getElementById('charCount');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');
const uploadAnotherBtn = document.getElementById('uploadAnotherBtn');
const notification = document.getElementById('notification');

// Event Listeners
uploadArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
copyBtn.addEventListener('click', copyToClipboard);
downloadBtn.addEventListener('click', downloadText);
clearBtn.addEventListener('click', clearResults);
uploadAnotherBtn.addEventListener('click', uploadAnother);

// Drag and Drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// File Selection Handler
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// Validate and Upload File
function handleFile(file) {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
        showNotification('Please upload a valid file (JPEG, JPG, PNG, or PDF)', 'error');
        return;
    }
    
    // Validate file size (16MB)
    const maxSize = 16 * 1024 * 1024;
    if (file.size > maxSize) {
        showNotification('File size must be less than 16MB', 'error');
        return;
    }
    
    // Upload file
    uploadFile(file);
}

// Upload File to Server
function uploadFile(file) {
    // Show progress
    uploadSection.querySelector('.upload-area').style.display = 'none';
    progressContainer.style.display = 'block';
    resultsSection.style.display = 'none';
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Make AJAX request
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Display results
        displayResults(data);
        showNotification('Text extracted successfully!', 'success');
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification(error.message || 'Error processing file. Please try again.', 'error');
        resetUploadArea();
    });
}

// Display Extracted Text
function displayResults(data) {
    // Hide progress and upload area
    progressContainer.style.display = 'none';
    
    // Show results
    extractedText.value = data.text || 'No text found in the image.';
    wordCount.textContent = `${data.word_count || 0} words`;
    charCount.textContent = `${data.char_count || 0} characters`;
    
    resultsSection.style.display = 'block';
}

// Copy to Clipboard
function copyToClipboard() {
    extractedText.select();
    document.execCommand('copy');
    
    // Update button text temporarily
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<span class="btn-icon">✓</span> Copied!';
    copyBtn.style.background = 'var(--success-color)';
    
    setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.style.background = '';
    }, 2000);
    
    showNotification('Text copied to clipboard!', 'success');
}

// Download as TXT File
function downloadText() {
    const text = extractedText.value;
    if (!text) {
        showNotification('No text to download', 'error');
        return;
    }
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-text-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Text downloaded successfully!', 'success');
}

// Clear Results
function clearResults() {
    extractedText.value = '';
    wordCount.textContent = '0 words';
    charCount.textContent = '0 characters';
    showNotification('Results cleared', 'success');
}

// Upload Another File
function uploadAnother() {
    resetUploadArea();
    fileInput.value = '';
}

// Reset Upload Area
function resetUploadArea() {
    uploadSection.querySelector('.upload-area').style.display = 'block';
    progressContainer.style.display = 'none';
    resultsSection.style.display = 'none';
}

// Show Notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Prevent default drag and drop on the entire page
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
});

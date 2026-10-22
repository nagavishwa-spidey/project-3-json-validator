/**
 * Frontend Application Logic
 * Handles tab switching, API calls, result rendering, and user interactions.
 */

// ===================== Tab Switching =====================

document.addEventListener('DOMContentLoaded', () => {
  // Tab navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      switchTab(targetTab);
    });
  });

  // Line number updates for all textareas
  document.querySelectorAll('textarea').forEach(textarea => {
    textarea.addEventListener('input', () => updateLineNumbers(textarea));
    textarea.addEventListener('scroll', () => syncScroll(textarea));
    // Initialize line numbers
    updateLineNumbers(textarea);
  });
});

function switchTab(tabName) {
  // Remove active from all tabs and content
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  // Activate selected tab
  document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

// ===================== Line Numbers =====================

function updateLineNumbers(textarea) {
  const linesEl = document.getElementById(`${textarea.id}-lines`);
  if (!linesEl) return;

  const lines = textarea.value.split('\n');
  const lineNums = lines.map((_, i) => i + 1).join('\n');
  linesEl.textContent = lineNums;
}

function syncScroll(textarea) {
  const linesEl = document.getElementById(`${textarea.id}-lines`);
  if (linesEl) {
    linesEl.scrollTop = textarea.scrollTop;
  }
}

// ===================== API Helpers =====================

const API_BASE = '/api';

async function apiCall(endpoint, body) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return data;
  } catch (err) {
    return { success: false, error: `Network error: ${err.message}` };
  }
}

// ===================== Validate Tab =====================

async function validateJson() {
  const json = document.getElementById('validate-json').value;
  const resultPanel = document.getElementById('validate-result');

  if (!json.trim()) {
    resultPanel.innerHTML = renderError('Please enter JSON to validate.');
    return;
  }

  const data = await apiCall('/validate', { json });

  if (!data.success) {
    resultPanel.innerHTML = renderError(data.error);
    return;
  }

  if (data.result.valid) {
    resultPanel.innerHTML = renderSuccess('✅ Valid JSON!', 'Your JSON is syntactically correct.');
  } else {
    const err = data.result.error;
    let details = `${err.message}`;
    if (err.line) details += `\nLine: ${err.line}, Column: ${err.column}`;
    if (err.context) details += `\n\n${err.context}`;
    resultPanel.innerHTML = renderError('❌ Invalid JSON', details);
  }
}

async function validateWithSchema() {
  const json = document.getElementById('validate-json').value;
  const schema = document.getElementById('validate-schema').value;
  const resultPanel = document.getElementById('validate-result');

  if (!json.trim()) {
    resultPanel.innerHTML = renderError('Please enter JSON to validate.');
    return;
  }

  if (!schema.trim()) {
    resultPanel.innerHTML = renderError('Please enter a JSON Schema for schema validation.');
    return;
  }

  const data = await apiCall('/validate-schema', { json, schema });

  if (!data.success) {
    resultPanel.innerHTML = renderError(data.error);
    return;
  }

  if (data.result.valid) {
    resultPanel.innerHTML = renderSuccess('✅ Schema Valid!', 'Your JSON conforms to the provided schema.');
  } else {
    let html = '<div class="result-error"><h3>❌ Schema Validation Failed</h3>';
    html += `<p>${data.result.errors.length} error(s) found:</p>`;
    html += '<ul class="schema-errors">';
    data.result.errors.forEach(err => {
      html += `<li><span class="error-path">${err.path || '/'}</span>: ${err.message} (${err.keyword})</li>`;
    });
    html += '</ul></div>';
    resultPanel.innerHTML = html;
  }
}

// ===================== Format Tab =====================

async function formatJson(action) {
  const json = document.getElementById('format-json').value;
  const outputEl = document.getElementById('format-output');

  if (!json.trim()) {
    outputEl.value = 'Please enter JSON to format.';
    updateLineNumbers(outputEl);
    return;
  }

  const data = await apiCall('/format', { json, action });

  if (data.success) {
    outputEl.value = data.result;
  } else {
    outputEl.value = `Error: ${data.error}`;
  }

  updateLineNumbers(outputEl);
}

// ===================== Compare Tab =====================

async function compareJson() {
  const json1 = document.getElementById('compare-json1').value;
  const json2 = document.getElementById('compare-json2').value;
  const resultPanel = document.getElementById('compare-result');

  if (!json1.trim() || !json2.trim()) {
    resultPanel.innerHTML = renderError('Please enter JSON in both fields.');
    return;
  }

  const data = await apiCall('/compare', { json1, json2 });

  if (!data.success) {
    resultPanel.innerHTML = renderError(data.error);
    return;
  }

  if (data.result.identical) {
    resultPanel.innerHTML = renderSuccess('✅ Identical!', 'Both JSON documents are identical.');
    return;
  }

  let html = '<div class="result-info"><h3>🔄 Differences Found</h3>';
  html += `<p>${data.result.differences.length} difference(s) detected:</p>`;
  html += '<ul class="diff-list">';

  data.result.differences.forEach(diff => {
    const className = `diff-${diff.type.replace('_', '-')}`;
    const typeLabel = diff.type.replace('_', ' ').toUpperCase();

    html += `<li class="diff-item ${className}">`;
    html += `<span class="diff-path">[${typeLabel}] ${diff.path}</span>`;

    if (diff.type === 'changed' || diff.type === 'type_changed') {
      html += `<span>Old: ${JSON.stringify(diff.oldValue)}</span>`;
      html += `<span>New: ${JSON.stringify(diff.newValue)}</span>`;
    } else if (diff.type === 'added') {
      html += `<span>Value: ${JSON.stringify(diff.newValue)}</span>`;
    } else if (diff.type === 'removed') {
      html += `<span>Value: ${JSON.stringify(diff.oldValue)}</span>`;
    }

    html += '</li>';
  });

  html += '</ul></div>';
  resultPanel.innerHTML = html;
}

// ===================== Info Tab =====================

async function analyzeJson() {
  const json = document.getElementById('info-json').value;
  const resultPanel = document.getElementById('info-result');

  if (!json.trim()) {
    resultPanel.innerHTML = renderError('Please enter JSON to analyze.');
    return;
  }

  const data = await apiCall('/info', { json });

  if (!data.success) {
    resultPanel.innerHTML = renderError(data.error);
    return;
  }

  const info = data.result;
  let html = '<div class="info-cards">';

  html += renderInfoCard('📦', 'Type', info.type);
  html += renderInfoCard('📏', 'Size', formatBytes(info.size));
  html += renderInfoCard('🔽', 'Depth', info.depth);

  if (info.keys) {
    html += renderInfoCard('🔑', 'Keys', info.keys.length);
  }

  if (info.length !== undefined) {
    html += renderInfoCard('📊', 'Length', info.length);
  }

  html += '</div>';

  // Show keys if object
  if (info.keys && info.keys.length > 0) {
    html += '<div style="margin-top: 1rem;"><strong>Keys:</strong>';
    html += '<div class="keys-list">';
    info.keys.forEach(key => {
      html += `<span class="key-tag">${escapeHtml(key)}</span>`;
    });
    html += '</div></div>';
  }

  resultPanel.innerHTML = html;
}

// ===================== Sample Data =====================

const SAMPLE_JSON = {
  validate: JSON.stringify({
    name: "John Doe",
    age: 30,
    email: "john@example.com",
    address: {
      street: "123 Main St",
      city: "Springfield",
      state: "IL",
      zip: "62701"
    },
    hobbies: ["reading", "coding", "gaming"],
    isActive: true
  }, null, 2),

  schema: JSON.stringify({
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["name", "age", "email"],
    "properties": {
      "name": { "type": "string", "minLength": 1 },
      "age": { "type": "integer", "minimum": 0, "maximum": 150 },
      "email": { "type": "string", "format": "email" },
      "address": {
        "type": "object",
        "properties": {
          "street": { "type": "string" },
          "city": { "type": "string" },
          "state": { "type": "string" },
          "zip": { "type": "string" }
        }
      },
      "hobbies": {
        "type": "array",
        "items": { "type": "string" }
      },
      "isActive": { "type": "boolean" }
    }
  }, null, 2),

  compare1: JSON.stringify({
    name: "Alice",
    age: 25,
    skills: ["JavaScript", "Python"],
    active: true
  }, null, 2),

  compare2: JSON.stringify({
    name: "Alice",
    age: 26,
    skills: ["JavaScript", "Python", "Go"],
    active: false,
    role: "Developer"
  }, null, 2)
};

function loadSample(target) {
  switch (target) {
    case 'validate':
      document.getElementById('validate-json').value = SAMPLE_JSON.validate;
      updateLineNumbers(document.getElementById('validate-json'));
      break;
    case 'format':
      document.getElementById('format-json').value = SAMPLE_JSON.validate;
      updateLineNumbers(document.getElementById('format-json'));
      break;
    case 'compare1':
      document.getElementById('compare-json1').value = SAMPLE_JSON.compare1;
      updateLineNumbers(document.getElementById('compare-json1'));
      break;
    case 'compare2':
      document.getElementById('compare-json2').value = SAMPLE_JSON.compare2;
      updateLineNumbers(document.getElementById('compare-json2'));
      break;
    case 'info':
      document.getElementById('info-json').value = SAMPLE_JSON.validate;
      updateLineNumbers(document.getElementById('info-json'));
      break;
  }
}

function loadSampleSchema() {
  document.getElementById('validate-schema').value = SAMPLE_JSON.schema;
  updateLineNumbers(document.getElementById('validate-schema'));
}

// ===================== Utility Functions =====================

function clearField(id) {
  const el = document.getElementById(id);
  el.value = '';
  updateLineNumbers(el);
}

function copyOutput(id) {
  const el = document.getElementById(id);
  if (!el.value.trim()) return;

  navigator.clipboard.writeText(el.value).then(() => {
    showToast('Copied to clipboard!');
  }).catch(() => {
    // Fallback
    el.select();
    document.execCommand('copy');
    showToast('Copied to clipboard!');
  });
}

function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2500);
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderSuccess(title, message) {
  return `<div class="result-success"><h3>${title}</h3><p>${message}</p></div>`;
}

function renderError(title, details) {
  let html = `<div class="result-error"><h3>${title}</h3>`;
  if (details) {
    html += `<div class="error-detail">${escapeHtml(details)}</div>`;
  }
  html += '</div>';
  return html;
}

function renderInfoCard(icon, label, value) {
  return `
    <div class="info-card">
      <div class="card-icon">${icon}</div>
      <div class="card-label">${label}</div>
      <div class="card-value">${value}</div>
    </div>
  `;
}

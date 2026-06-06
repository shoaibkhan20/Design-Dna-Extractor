let extractedMarkdown = '';
let currentTabId = null;

const steps = [
  { id: 'colors', label: 'Extracting color palette' },
  { id: 'type', label: 'Analyzing typography' },
  { id: 'layout', label: 'Mapping layout & spacing' },
  { id: 'effects', label: 'Detecting effects & 3D' },
  { id: 'components', label: 'Scanning UI components' },
  { id: 'generating', label: 'Generating SKILL.md' }
];

async function initPopup() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTabId = tab.id;
    const url = new URL(tab.url);
    document.getElementById('siteDomain').textContent = url.hostname;
    document.getElementById('siteTitle').textContent = tab.title || '—';
    document.getElementById('siteInfo').classList.add('visible');
  } catch (e) {
    console.error('initPopup failed:', e);
  }
}

function renderSteps() {
  const container = document.getElementById('progressSteps');
  container.innerHTML = steps.map(s =>
    `<div class="step" id="step-${s.id}">
      <div class="step-dot"></div>
      <span>${s.label}</span>
    </div>`
  ).join('');
}

function setStep(id, state) {
  const el = document.getElementById(`step-${id}`);
  if (!el) return;
  el.className = `step ${state}`;
}

function setProgress(pct) {
  document.getElementById('progressBar').style.width = pct + '%';
}

function showError(msg) {
  const box = document.getElementById('errorBox');
  box.textContent = msg;
  box.classList.add('visible');
}

async function startExtraction() {
  const btn = document.getElementById('extractBtn');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div><span>Extracting…</span>';

  document.getElementById('errorBox').classList.remove('visible');
  document.getElementById('results').classList.remove('visible');

  renderSteps();
  document.getElementById('progress').classList.add('visible');
  setProgress(5);

  try {
    await chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      files: ['content.js']
    });
  } catch (e) {
    console.error('Content script injection failed:', e);
  }

  const stepIds = steps.map(s => s.id);
  let pct = 5;

  for (let i = 0; i < stepIds.length - 1; i++) {
    setStep(stepIds[i], 'active');
    await delay(300 + Math.random() * 200);
    setStep(stepIds[i], 'done');
    pct += 15;
    setProgress(pct);
  }

  setStep('generating', 'active');
  setProgress(90);

  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      func: () => window.__extractDesignDNA ? window.__extractDesignDNA() : { success: false, error: 'Content script not loaded. Refresh the page and try again.' }
    });

    const data = result.result;

    if (!data.success) {
      throw new Error(data.error || 'Extraction failed');
    }

    extractedMarkdown = data.markdown;
    setStep('generating', 'done');
    setProgress(100);

    await delay(300);
    document.getElementById('progress').classList.remove('visible');
    showResults(data);

  } catch (err) {
    showError('Error: ' + err.message);
    document.getElementById('progress').classList.remove('visible');
  }

  btn.disabled = false;
  btn.innerHTML = '<span>⚡</span><span>Extract Again</span>';
}

function showResults(data) {
  const { summary, markdown } = data;

  const statsEl = document.getElementById('resultStats');
  statsEl.innerHTML = `
    <div class="stat-pill"><div class="num">${summary.colorCount}</div><div class="lbl">Colors</div></div>
    <div class="stat-pill"><div class="num">${summary.effectsCount}</div><div class="lbl">Effects</div></div>
  `;

  document.getElementById('previewText').textContent = markdown.substring(0, 600) + '…';
  document.getElementById('results').classList.add('visible');
}

function downloadFile() {
  const hostname = document.getElementById('siteDomain').textContent.replace(/[^a-z0-9]/gi, '-');
  const filename = `design-dna-${hostname}.md`;
  const blob = new Blob([extractedMarkdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(extractedMarkdown);
    const btn = document.getElementById('copyBtn');
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = '⎘ Copy';
      btn.classList.remove('copied');
    }, 2000);
  } catch (e) {
    alert('Copy failed — use Download instead.');
  }
}

function resetUI() {
  extractedMarkdown = '';
  document.getElementById('results').classList.remove('visible');
  document.getElementById('errorBox').classList.remove('visible');
  document.getElementById('progress').classList.remove('visible');
  document.getElementById('extractBtn').innerHTML = '<span>⚡</span><span>Extract Design DNA</span>';
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// Bind event listeners (CSP-compliant, no inline handlers)
document.getElementById('extractBtn').addEventListener('click', startExtraction);
document.getElementById('downloadBtn').addEventListener('click', downloadFile);
document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
document.getElementById('resetBtn').addEventListener('click', resetUI);

initPopup();

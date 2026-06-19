/* ============================================================
   JUNO MODEL SWITCHER — 666 SOUNDS DESIGN
   Models: v5.5 Pro | v5.5 Pro Custom 1/2/3 | v4.5
   Persists to localStorage. Affects lyric generation style.
   ============================================================ */

// ── Juno Field Limits (official safe values) ─────────────────
const JUNO_LIMITS = {
  style:    1000,
  lyric:    5000,
  extended:  800,
  title:      80
};

// ── Model Definitions ─────────────────────────────────────────
const JUNO_MODELS = [
  {
    id:       'v55pro',
    label:    'v5.5 Pro',
    sublabel: 'Standard — volle Kapazität',
    icon:     '⚡',
    custom:   false,
    tier:     'pro',
    lyricStyle: {
      complexity:   'high',
      metaphorDepth: 'deep',
      structureHint: 'Komplexe Section-Strukturen, tiefe Metaphern, narrativer Arc über ganzen Track',
      maxSections:   12,
      promptSuffix:  'Complex multilayered narrative, rich psychedelic imagery, advanced poetic structure'
    }
  },
  {
    id:       'v55custom1',
    label:    'Custom 1',
    sublabel: '',   // editierbar
    icon:     '🎛️',
    custom:   true,
    customIndex: 1,
    tier:     'custom',
    lyricStyle: {
      complexity:    'high',
      metaphorDepth: 'deep',
      structureHint:  'Custom-Modell — volle Lyrik-Komplexität wie v5.5 Pro',
      maxSections:    12,
      promptSuffix:   'Custom model fine-tuned style, full complexity'
    }
  },
  {
    id:       'v55custom2',
    label:    'Custom 2',
    sublabel: '',
    icon:     '🎛️',
    custom:   true,
    customIndex: 2,
    tier:     'custom',
    lyricStyle: {
      complexity:    'high',
      metaphorDepth: 'deep',
      structureHint:  'Custom-Modell — volle Lyrik-Komplexität wie v5.5 Pro',
      maxSections:    12,
      promptSuffix:   'Custom model fine-tuned style, full complexity'
    }
  },
  {
    id:       'v55custom3',
    label:    'Custom 3',
    sublabel: '',
    icon:     '🎛️',
    custom:   true,
    customIndex: 3,
    tier:     'custom',
    lyricStyle: {
      complexity:    'high',
      metaphorDepth: 'deep',
      structureHint:  'Custom-Modell — volle Lyrik-Komplexität wie v5.5 Pro',
      maxSections:    12,
      promptSuffix:   'Custom model fine-tuned style, full complexity'
    }
  },
  {
    id:       'v45',
    label:    'v4.5',
    sublabel: 'Fallback — Monatsende',
    icon:     '🔋',
    custom:   false,
    tier:     'fallback',
    lyricStyle: {
      complexity:    'medium',
      metaphorDepth: 'moderate',
      structureHint:  'Einfachere Strukturen, kürzere Sections, klare direkte Sprache — v4.5 performt besser mit weniger Komplexität',
      maxSections:    8,
      promptSuffix:   'Clear direct language, simpler structure, strong hooks, straightforward narrative'
    }
  }
];

// ── State ──────────────────────────────────────────────────────
const junoModelState = {
  activeModelId:  'v55pro',
  customNames:    { 1: '', 2: '', 3: '' }   // User-defined names for Custom 1/2/3
};

// ── localStorage keys ─────────────────────────────────────────
const LS_MODEL_KEY       = '666sounds_juno_model';
const LS_CUSTOM_NAMES_KEY = '666sounds_juno_custom_names';

// ── Load from localStorage ────────────────────────────────────
function junoModelLoad() {
  try {
    const savedModel = localStorage.getItem(LS_MODEL_KEY);
    if (savedModel && JUNO_MODELS.find(m => m.id === savedModel)) {
      junoModelState.activeModelId = savedModel;
    }
    const savedNames = localStorage.getItem(LS_CUSTOM_NAMES_KEY);
    if (savedNames) {
      const parsed = JSON.parse(savedNames);
      junoModelState.customNames = { ...junoModelState.customNames, ...parsed };
    }
  } catch(e) { /* ignore */ }
}

// ── Save to localStorage ──────────────────────────────────────
function junoModelSave() {
  try {
    localStorage.setItem(LS_MODEL_KEY, junoModelState.activeModelId);
    localStorage.setItem(LS_CUSTOM_NAMES_KEY, JSON.stringify(junoModelState.customNames));
  } catch(e) { /* ignore */ }
}

// ── Get active model ──────────────────────────────────────────
function junoGetActiveModel() {
  return JUNO_MODELS.find(m => m.id === junoModelState.activeModelId) || JUNO_MODELS[0];
}

// ── Get display name for a model (uses custom name if set) ───
function junoModelDisplayName(model) {
  if (model.custom) {
    const customName = junoModelState.customNames[model.customIndex];
    return customName ? customName : `Custom ${model.customIndex}`;
  }
  return model.label;
}

// ── Switch model ──────────────────────────────────────────────
function junoSetModel(modelId) {
  const model = JUNO_MODELS.find(m => m.id === modelId);
  if (!model) return;
  junoModelState.activeModelId = modelId;
  junoModelSave();
  renderJunoModelUI();
  updateJunoLimitDisplays();
  dispatchModelChange(model);
}

// ── Save custom name ──────────────────────────────────────────
function junoSaveCustomName(index, name) {
  junoModelState.customNames[index] = name.trim();
  junoModelSave();
  renderJunoModelUI();
}

// ── Dispatch change event (lyric.engine.js listens) ──────────
function dispatchModelChange(model) {
  window.JUNO_ACTIVE_MODEL = model;
  document.dispatchEvent(new CustomEvent('junoModelChanged', { detail: model }));
}

// ── Update all char-limit displays across the app ─────────────
function updateJunoLimitDisplays() {
  // Style counters (matrix-char-count + main char-count)
  ['char-count', 'matrix-char-count'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const current = parseInt(el.textContent) || 0;
    updateCharCounter(el, current, JUNO_LIMITS.style);
  });

  // Extended prompt counter
  const extEl = document.getElementById('extended-prompt-char-count');
  if (extEl) {
    const text = document.getElementById('extended-prompt-text')?.value || '';
    const len = text.length;
    extEl.textContent = `${len} / ${JUNO_LIMITS.extended}`;
    extEl.className = 'extended-prompt-char-count' + (len > JUNO_LIMITS.extended ? ' over-limit' : '');
  }

  // Lyric counter
  const lyrEl = document.getElementById('lyric-manual-char');
  if (lyrEl) {
    const text = document.getElementById('lyric-manual-text')?.value || '';
    lyrEl.textContent = `${text.length} / ${JUNO_LIMITS.lyric}`;
  }

  // Update model badge in header
  const badge = document.getElementById('juno-model-badge');
  if (badge) {
    const m = junoGetActiveModel();
    badge.textContent = junoModelDisplayName(m);
    badge.dataset.tier = m.tier;
  }

  // Update floating badge
  const floatBadge = document.getElementById('juno-floating-badge');
  const floatLabel = document.getElementById('juno-floating-badge-label');
  if (floatBadge && floatLabel) {
    const m = junoGetActiveModel();
    floatLabel.textContent = junoModelDisplayName(m);
    floatBadge.dataset.tier = m.tier;
  }
}

function updateCharCounter(el, len, limit) {
  const warnAt = Math.floor(limit * 0.92);
  el.textContent = `${len}/${limit}`;
  el.className = 'char-counter ' + (len > limit ? 'char-over' : len > warnAt ? 'char-warn' : 'char-ok');
}

// ── Render Model Switcher UI ──────────────────────────────────
function renderJunoModelUI() {
  const container = document.getElementById('juno-model-cards');
  if (!container) return;

  container.innerHTML = JUNO_MODELS.map(model => {
    const isActive  = model.id === junoModelState.activeModelId;
    const dispName  = junoModelDisplayName(model);

    let nameEl = '';
    if (model.custom) {
      const savedName = junoModelState.customNames[model.customIndex] || '';
      nameEl = `
        <input
          class="juno-custom-name-input"
          type="text"
          placeholder="Name eingeben..."
          value="${savedName}"
          data-custom-index="${model.customIndex}"
          maxlength="30"
          autocorrect="off" spellcheck="false"
        >`;
    }

    const sublabel = model.custom
      ? (junoModelState.customNames[model.customIndex] ? `Custom v5.5` : 'Name eingeben →')
      : model.sublabel;

    return `
      <div
        class="juno-model-card ${isActive ? 'active' : ''} tier-${model.tier}"
        data-model-id="${model.id}"
        role="radio"
        aria-checked="${isActive}"
        tabindex="0"
      >
        <div class="juno-model-card-inner">
          <div class="juno-model-radio">
            <div class="juno-radio-dot ${isActive ? 'active' : ''}"></div>
          </div>
          <div class="juno-model-info">
            <div class="juno-model-name">
              <span class="juno-model-icon">${model.icon}</span>
              <span class="juno-model-label">${dispName}</span>
            </div>
            <div class="juno-model-sublabel">${sublabel}</div>
            ${nameEl}
          </div>
          ${isActive ? '<div class="juno-model-active-tag">AKTIV</div>' : ''}
        </div>
        ${isActive ? `<div class="juno-model-style-hint">${model.lyricStyle.structureHint}</div>` : ''}
      </div>
    `;
  }).join('');

  // Bind click events
  container.querySelectorAll('.juno-model-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't switch if clicking the name input
      if (e.target.classList.contains('juno-custom-name-input')) return;
      junoSetModel(card.dataset.modelId);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') junoSetModel(card.dataset.modelId);
    });
  });

  // Bind custom name inputs
  container.querySelectorAll('.juno-custom-name-input').forEach(input => {
    input.addEventListener('change', (e) => {
      junoSaveCustomName(parseInt(e.target.dataset.customIndex), e.target.value);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.target.blur(); }
      e.stopPropagation();  // prevent card click
    });
  });
}

// ── Build Model Switcher Section (injected into Settings panel) ─
function buildJunoModelSection() {
  const container = document.getElementById('juno-model-section');
  if (!container) return;

  container.innerHTML = `
    <div class="juno-model-header-bar">
      <div class="juno-model-header-left">
        <span class="juno-model-header-icon">🎵</span>
        <span class="juno-model-header-title">JUNO MODELL</span>
      </div>
      <div class="juno-model-badge-wrap">
        <span class="juno-model-badge" id="juno-model-badge"></span>
      </div>
    </div>
    <div class="juno-model-cards" id="juno-model-cards"></div>
    <div class="juno-limits-row">
      <div class="juno-limit-chip">
        <span class="juno-limit-label">Style</span>
        <span class="juno-limit-value">${JUNO_LIMITS.style}</span>
      </div>
      <div class="juno-limit-chip">
        <span class="juno-limit-label">Lyrik</span>
        <span class="juno-limit-value">${JUNO_LIMITS.lyric}</span>
      </div>
      <div class="juno-limit-chip">
        <span class="juno-limit-label">Extended</span>
        <span class="juno-limit-value">${JUNO_LIMITS.extended}</span>
      </div>
      <div class="juno-limit-chip">
        <span class="juno-limit-label">Titel</span>
        <span class="juno-limit-value">${JUNO_LIMITS.title}</span>
      </div>
    </div>
  `;

  renderJunoModelUI();
  updateJunoLimitDisplays();
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  junoModelLoad();
  buildJunoModelSection();

  // Expose globals
  window.JUNO_LIMITS       = JUNO_LIMITS;
  window.JUNO_MODELS       = JUNO_MODELS;
  window.junoGetActiveModel = junoGetActiveModel;
  window.junoModelDisplayName = junoModelDisplayName;
  window.JUNO_ACTIVE_MODEL  = junoGetActiveModel();
});

/* ============================================================
   666 SOUNDS DESIGN — matrix.js
   Modular Matrix: Core + Psycho + 4D → 200-char Master Prompt
   ============================================================ */

'use strict';

// ============================================================
// TAG COMPRESSOR
// ============================================================
const TAG_SUBSTITUTIONS = {
  'euphoric leads':                 'euph leads',
  'punchy kick':                    'punchy kick',
  'pumping bassline':               'pump bass',
  'festival energy':                'festival',
  'twisting arps':                  'twist arps',
  'ominous atmosphere':             'ominous atm',
  'distorted bass':                 'dist bass',
  'dark ritual energy':             'dark ritual',
  'glitchy fx':                     'glitch fx',
  'underground vibe':               'underground',
  'organic textures':               'organic tex',
  'twisted bassline':               'twist bass',
  'forest ritual':                  'forest ritual',
  'shamanic fx':                    'shaman fx',
  'nature samples':                 'nature smp',
  'deep hypnotic groove':           'deep hypno',
  'rolling bass':                   'roll bass',
  'progressive build':              'prog build',
  'subtle tension':                 'subtle tens',
  'layered pads':                   'layer pads',
  'melodic spirals':                'mel spirals',
  'cosmic leads':                   'cosmic leads',
  'goa sunrise':                    'goa sunrise',
  'spiritual energy':               'spiritual',
  'classic acid lines':             'acid lines',
  'extreme speed':                  'extreme spd',
  'industrial kicks':               'indust kick',
  'cyber fx':                       'cyber fx',
  'hyper-complex patterns':         'hyper ptrn',
  'mechanical precision':           'mech prec',
  'acid bassline 303':              'acid 303',
  'squelchy filter sweep':          'squelch sw',
  'cosmic reverb FX':               'cosmic rev',
  'heavy sidechain compression':    'sidechain',
  'offbeat bass stabs':             'offbeat bass',
  'glitch percussion':              'glitch perc',
  'UV laser synth':                 'UV laser',
  'wobbly resonance':               'wobble res',
  'tribal percussion':              'tribal perc',
  'twisting arp lead':              'twist arp',
  'dark drone pad':                 'drone pad',
  'sharp synth stabs':              'synth stabs',
  'deep 808 sub bass':              '808 sub',
  'long cave reverb':               'cave rev',
  'robotic vocoder voice':          'vocoder',
  'tension riser FX':               'riser',
  'binaural beats':                 'binaural',
  'Haas stereo effect':             'haas stereo',
  'isochronic pulse rhythm':        'iso pulse',
  'tight dry studio':               'tight studio',
  'club room reverb':               'club rev',
  'deep cave reverb':               'cave rev',
  'infinite cosmic space reverb':   'cosmic void rev',
  '1st order ambisonics':           'FOA',
  '2nd order ambisonics':           'SOA',
  '3rd order ambisonics':           'TOA',
  'close proximity sound':          'near field',
  'mid-field placement':            'mid field',
  'distant spatial cue':            'far field',
  'infinite cosmic distance':       'cosmic dist',
  'slow Doppler shift':             'slow doppler',
  'Doppler pitch sweep':            'doppler sweep',
  'fast Doppler fly-by':            'fast doppler',
  'extreme Doppler warp':           'doppler warp',
  'orbit motion':                   'orbit',
  'spiral motion':                  'spiral',
  'pendulum motion':                'pendulum',
  'lissajous motion':               'lissajous',
  'ascent motion':                  'ascent',
  'vortex motion':                  'vortex',
  'quantum motion':                 'quantum'
};

function compressTags(str) {
  let result = str;
  for (const [long, short] of Object.entries(TAG_SUBSTITUTIONS)) {
    result = result.replace(new RegExp(long, 'gi'), short);
  }
  return result;
}

function deduplicateTags(str) {
  const parts = str.split(',').map(s => s.trim().toLowerCase());
  const seen = new Set();
  const unique = [];
  for (const p of parts) {
    if (p && !seen.has(p)) { seen.add(p); unique.push(p); }
  }
  return unique.join(', ');
}

// ============================================================
// COMPATIBILITY RULES
// ============================================================
const COMPAT_RULES = [
  { a: 'dark',     b: 'trance',   status: 'synergy',  note: 'Perfect dark trance combo' },
  { a: 'dark',     b: 'ekstase',  status: 'conflict',  note: 'Ekstase brightens dark energy' },
  { a: 'forest',   b: 'trance',   status: 'synergy',  note: 'Forest+theta = shamanic trance' },
  { a: 'forest',   b: 'ritual',   status: 'synergy',  note: 'Ritual+forest = earth connection' },
  { a: 'goa',      b: 'ekstase',  status: 'synergy',  note: 'Goa+40Hz = cosmic euphoria' },
  { a: 'goa',      b: 'trance',   status: 'synergy',  note: 'Classic goa trance' },
  { a: 'hi-tech',  b: 'trance',   status: 'neutral',  note: 'High-speed theta possible' },
  { a: 'hi-tech',  b: 'meditation', status: 'conflict', note: 'Speed kills meditation' },
  { a: 'progressive', b: 'flow',  status: 'synergy',  note: 'Prog+alpha = perfect flow' },
  { a: 'zenonesque', b: 'meditation', status: 'synergy', note: 'Deep inner journey' },
  { a: 'full-on',  b: 'ekstase',  status: 'synergy',  note: 'Festival euphoria peak' },
  { a: 'orbit',    b: 'FOA',      status: 'synergy',  note: 'Orbit works well with FOA' },
  { a: 'vortex',   b: 'TOA',      status: 'synergy',  note: 'Vortex maximized by TOA' },
  { a: 'sidechain', b: 'pendulum', status: 'neutral', note: 'Rhythmic combo possible' }
];

function checkCompatibility(subgenre, psychoProfile, motionPath, ambOrder) {
  const results = [];
  for (const rule of COMPAT_RULES) {
    const vals = [subgenre, psychoProfile, motionPath, ambOrder ? `${['Stereo','FOA','SOA','TOA'][ambOrder]}` : 'Stereo'];
    const hasA = vals.includes(rule.a);
    const hasB = vals.includes(rule.b);
    if (hasA && hasB) results.push(rule);
  }
  return results;
}

// ============================================================
// STATE
// ============================================================
const matrixState = {
  coreActive:    true,
  psychoActive:  true,
  fourDActive:   true,
  matrixPresets: [],
  compatResults: []
};

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  buildMatrixSlots();
  bindMatrixActions();
  renderCompatTable();
  buildMatrixPrompt();
  buildMatrixPresets();
});

// ============================================================
// MATRIX SLOTS
// ============================================================
function buildMatrixSlots() {
  updateSlotUI('core',   matrixState.coreActive);
  updateSlotUI('psycho', matrixState.psychoActive);
  updateSlotUI('4d',     matrixState.fourDActive);

  bindSlotToggle('slot-toggle-core',   'core');
  bindSlotToggle('slot-toggle-psycho', 'psycho');
  bindSlotToggle('slot-toggle-4d',     '4d');
}

function bindSlotToggle(btnId, slot) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (slot === 'core')   matrixState.coreActive   = !matrixState.coreActive;
    if (slot === 'psycho') matrixState.psychoActive = !matrixState.psychoActive;
    if (slot === '4d')     matrixState.fourDActive  = !matrixState.fourDActive;
    updateSlotUI(slot, slot === 'core' ? matrixState.coreActive : slot === 'psycho' ? matrixState.psychoActive : matrixState.fourDActive);
    buildMatrixPrompt();
    renderCompatTable();
  });
}

function updateSlotUI(slot, active) {
  const slotEl  = document.getElementById(`matrix-slot-${slot}`);
  const toggleEl = document.getElementById(`slot-toggle-${slot}`);
  if (slotEl) slotEl.classList.toggle('slot-active', active);
  if (toggleEl) toggleEl.classList.toggle('on', active);
}

// ============================================================
// MASTER PROMPT BUILDER
// ============================================================
function buildMatrixPrompt() {
  const parts = [];

  if (matrixState.coreActive && window.APP_buildPrompt) {
    const core = window.APP_buildPrompt();
    if (core) parts.push(core);
  }

  if (matrixState.psychoActive && window.PSYCHO_TAGS) {
    parts.push(window.PSYCHO_TAGS);
  }

  if (matrixState.fourDActive && window.ENGINE_4D_TAGS) {
    parts.push(window.ENGINE_4D_TAGS);
  }

  let merged = parts.join(', ');
  merged = compressTags(merged);
  merged = deduplicateTags(merged);

  // Trim to 200 chars
  if (merged.length > 200) {
    merged = merged.substring(0, 200);
    const lastComma = merged.lastIndexOf(',');
    if (lastComma > 150) merged = merged.substring(0, lastComma);
  }

  const el = document.getElementById('matrix-output');
  if (el) el.textContent = merged;

  const counter = document.getElementById('matrix-char-count');
  if (counter) {
    const len = merged.length;
    counter.textContent = `${len}/200`;
    counter.className = 'char-counter ' + (len > 200 ? 'char-over' : len > 185 ? 'char-warn' : 'char-ok');
  }

  window.MATRIX_MASTER_PROMPT = merged;

  // Compat check
  const subgenre = window.APP_STATE?.subgenre || 'dark';
  const profile  = typeof psychoState !== 'undefined' ? psychoState.profile : 'trance';
  const motion   = typeof state4D !== 'undefined' ? state4D.motion : 'orbit';
  const ambOrder = typeof state4D !== 'undefined' ? state4D.ambOrder : 1;
  matrixState.compatResults = checkCompatibility(subgenre, profile, motion, ambOrder);
  renderCompatTable();
}

// ============================================================
// COMPAT TABLE
// ============================================================
function renderCompatTable() {
  const el = document.getElementById('compat-table-body');
  if (!el) return;
  const results = matrixState.compatResults;
  if (!results.length) {
    el.innerHTML = '<tr><td colspan="3" style="color:var(--text-muted);text-align:center">Keine aktiven Regeln</td></tr>';
    return;
  }
  el.innerHTML = results.map(r => `
    <tr>
      <td>${r.a} + ${r.b}</td>
      <td class="compat-${r.status}">${r.status === 'synergy' ? '✅ Synergy' : r.status === 'conflict' ? '🚫 Conflict' : '◻ Neutral'}</td>
      <td>${r.note}</td>
    </tr>`).join('');
}

// ============================================================
// MATRIX PRESETS
// ============================================================
const MATRIX_FACTORY = [
  { name: 'Full 4D Ritual',   core: true, psycho: true, fourD: true },
  { name: 'Core Only',        core: true, psycho: false, fourD: false },
  { name: 'Psycho + Core',    core: true, psycho: true, fourD: false },
  { name: '4D + Core',        core: true, psycho: false, fourD: true }
];

function buildMatrixPresets() {
  const el = document.getElementById('matrix-factory-presets');
  if (!el) return;
  el.innerHTML = '';
  MATRIX_FACTORY.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.textContent = p.name;
    btn.addEventListener('click', () => {
      matrixState.coreActive   = p.core;
      matrixState.psychoActive = p.psycho;
      matrixState.fourDActive  = p.fourD;
      buildMatrixSlots();
      buildMatrixPrompt();
      if (window.APP_showToast) window.APP_showToast(`Matrix: ${p.name}`);
    });
    el.appendChild(btn);
  });

  const saveBtn = document.getElementById('btn-save-matrix-preset');
  if (saveBtn) saveBtn.addEventListener('click', () => {
    const nameEl = document.getElementById('matrix-preset-name');
    const name = nameEl?.value.trim() || `Matrix ${matrixState.matrixPresets.length + 1}`;
    matrixState.matrixPresets.push({
      name,
      core: matrixState.coreActive,
      psycho: matrixState.psychoActive,
      fourD: matrixState.fourDActive,
      prompt: window.MATRIX_MASTER_PROMPT || ''
    });
    if (nameEl) nameEl.value = '';
    renderUserMatrixPresets();
    if (window.APP_showToast) window.APP_showToast('Matrix Preset gespeichert!');
  });
}

function renderUserMatrixPresets() {
  const el = document.getElementById('matrix-user-presets');
  if (!el) return;
  el.innerHTML = '';
  if (!matrixState.matrixPresets.length) {
    el.innerHTML = '<span class="text-muted font-mono" style="font-size:0.62rem">Keine User-Presets</span>';
    return;
  }
  matrixState.matrixPresets.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.textContent = p.name;
    btn.addEventListener('click', () => {
      matrixState.coreActive   = p.core;
      matrixState.psychoActive = p.psycho;
      matrixState.fourDActive  = p.fourD;
      buildMatrixSlots();
      buildMatrixPrompt();
      if (window.APP_showToast) window.APP_showToast(`Matrix: ${p.name}`);
    });
    el.appendChild(btn);
  });
}

// ============================================================
// BIND ACTIONS
// ============================================================
function bindMatrixActions() {
  const copyBtn = document.getElementById('btn-copy-matrix');
  if (copyBtn) copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(window.MATRIX_MASTER_PROMPT || '').then(() => {
      if (window.APP_showToast) window.APP_showToast('Master Prompt kopiert!');
    });
  });

  const rebuildBtn = document.getElementById('btn-rebuild-matrix');
  if (rebuildBtn) rebuildBtn.addEventListener('click', () => {
    buildMatrixPrompt();
    if (window.APP_showToast) window.APP_showToast('Matrix neu gebaut!');
  });
}

// Auto-rebuild every 2s when matrix panel is visible
setInterval(() => {
  const panel = document.getElementById('panel-matrix');
  if (panel && panel.classList.contains('active')) {
    buildMatrixPrompt();
  }
}, 2000);

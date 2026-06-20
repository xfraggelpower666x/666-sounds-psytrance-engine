/* ============================================================
   666 SOUNDS DESIGN — app.js
   Core Generator + Guard + Orchestra + Audit + Backup + Register
   ============================================================ */

'use strict';

// ============================================================
// SUBGENRE DATA
// ============================================================
const SUBGENRES = {
  'full-on': {
    label: 'Full-On', bpm: [143, 147], color: '#ff2d78',
    tags: ['euphoric leads', 'punchy kick', 'pumping bassline', 'festival energy', 'twisting arps'],
    visual: 'festival stage explosion, neon laser grid, psychedelic vortex, UV fluorescent crowd',
    lyricSet: 'default'
  },
  'dark': {
    label: 'Dark Psy', bpm: [148, 155], color: '#c92fff',
    tags: ['ominous atmosphere', 'distorted bass', 'dark ritual energy', 'glitchy fx', 'underground vibe'],
    visual: 'dark ritual underground rave, UV neon glitch, demonic geometry, purple smoke machine',
    lyricSet: 'dark'
  },
  'forest': {
    label: 'Forest', bpm: [148, 155], color: '#00ff9d',
    tags: ['organic textures', 'twisted bassline', 'forest ritual', 'shamanic fx', 'nature samples'],
    visual: 'bioluminescent forest rave, UV glowing mushrooms, tribal fire circle, sacred geometry',
    lyricSet: 'forest'
  },
  'progressive': {
    label: 'Progressive', bpm: [138, 143], color: '#00e5ff',
    tags: ['deep hypnotic groove', 'rolling bass', 'progressive build', 'subtle tension', 'layered pads'],
    visual: 'deep cosmos travel, slowly shifting nebula, geometric progression, cold blue light',
    lyricSet: 'progressive'
  },
  'goa': {
    label: 'Goa', bpm: [140, 148], color: '#ffe000',
    tags: ['melodic spirals', 'cosmic leads', 'goa sunrise', 'spiritual energy', 'classic acid lines'],
    visual: 'Goa beach sunrise rave, cosmic mandalas, spiritual light beams, Indian temple backdrop',
    lyricSet: 'goa'
  },
  'hi-tech': {
    label: 'Hi-Tech', bpm: [155, 165], color: '#ff7a00',
    tags: ['extreme speed', 'industrial kicks', 'cyber fx', 'hyper-complex patterns', 'mechanical precision'],
    visual: 'cyberpunk industrial hell, neon orange sparks, machine overlord, tech horror aesthetic',
    lyricSet: 'hitech'
  },
  'suomi': {
    label: 'Suomi', bpm: [148, 155], color: '#ff2d78',
    tags: ['aggressive drive', 'rolling mid-bass', 'scandinavian darkness', 'raw energy', 'nordic mysticism'],
    visual: 'northern lights underground rave, raw concrete walls, intense strobes, arctic darkness',
    lyricSet: 'dark'
  },
  'zenonesque': {
    label: 'Zenonesque', bpm: [138, 143], color: '#c92fff',
    tags: ['deep meditative layers', 'minimal groove', 'cosmic depth', 'hypnotic repetition', 'inner journey'],
    visual: 'deep space meditation, fractal geometry, slow nebula drift, consciousness expansion',
    lyricSet: 'progressive'
  }
};

const SONIC_ELEMENTS = [
  { id: 'acid',       label: 'Acid Bass',      tag: 'acid bassline 303' },
  { id: 'squelch',    label: 'Squelch',        tag: 'squelchy filter sweep' },
  { id: 'cosmic',     label: 'Cosmic FX',      tag: 'cosmic reverb FX' },
  { id: 'sidechain',  label: 'Sidechain',      tag: 'heavy sidechain compression' },
  { id: 'offbeat',    label: 'Offbeat Bass',   tag: 'offbeat bass stabs' },
  { id: 'glitch',     label: 'Glitch',         tag: 'glitch percussion' },
  { id: 'uv',         label: 'UV Laser',       tag: 'UV laser synth' },
  { id: 'wobbly',     label: 'Wobble',         tag: 'wobbly resonance' },
  { id: 'tribal',     label: 'Tribal Perc',    tag: 'tribal percussion' },
  { id: 'arp',        label: 'Arp Lead',       tag: 'twisting arp lead' },
  { id: 'drone',      label: 'Drone Pad',      tag: 'dark drone pad' },
  { id: 'stab',       label: 'Stabs',          tag: 'sharp synth stabs' },
  { id: '808',        label: '808 Sub',        tag: 'deep 808 sub bass' },
  { id: 'reverb',     label: 'Cave Reverb',    tag: 'long cave reverb' },
  { id: 'vocoder',    label: 'Vocoder',        tag: 'robotic vocoder voice' },
  { id: 'risers',     label: 'Risers',         tag: 'tension riser FX' }
];

const MOODS = [
  { id: 'euphoric',    label: 'Euphoric',    tag: 'euphoric' },
  { id: 'dark',        label: 'Dark',        tag: 'dark' },
  { id: 'mystical',    label: 'Mystical',    tag: 'mystical' },
  { id: 'aggressive',  label: 'Aggressive',  tag: 'aggressive' },
  { id: 'hypnotic',    label: 'Hypnotic',    tag: 'hypnotic' },
  { id: 'spiritual',   label: 'Spiritual',   tag: 'spiritual' },
  { id: 'cosmic',      label: 'Cosmic',      tag: 'cosmic' },
  { id: 'ominous',     label: 'Ominous',     tag: 'ominous' },
  { id: 'meditative',  label: 'Meditative',  tag: 'meditative' },
  { id: 'chaotic',     label: 'Chaotic',     tag: 'chaotic' },
  { id: 'tribal',      label: 'Tribal',      tag: 'tribal' },
  { id: 'futuristic',  label: 'Futuristic',  tag: 'futuristic' },
  { id: 'lo-fi',       label: 'Lo-Fi',       tag: 'lo-fi' },
  { id: 'crisp',       label: 'Crisp',       tag: 'crisp mix' },
  { id: 'dreamy',      label: 'Dreamy',      tag: 'dreamy' },
  { id: 'industrial',  label: 'Industrial',  tag: 'industrial' }
];

const SCALES = ['Phrygian','Dorian','Harmonic Minor','Double Harmonic','Lydian','Locrian','Whole Tone','Chromatic'];
const MIX_TRAITS = ['huge low-end','crisp high hats','wide stereo','punchy transients','warm analog tape','cold digital precision','heavy reverb','dry and tight'];

const LYRIC_SETS = {
  dark: {
    intro: '[Intro]\n(ominous drone builds, 4 bars)\n',
    build: '[Build]\n(kick pattern: 4-on-the-floor intensifies)\n',
    drop:  '[Drop]\n(distorted bass hits, dark atmosphere explodes)\n',
    breakdown: '[Breakdown]\n(stripped layers, ritual percussion)\n',
    peak:  '[Peak]\n(full chaos, all elements at max)\n',
    outro: '[Outro]\n(slow dissolution into silence)\n'
  },
  forest: {
    intro: '[Intro]\n(nature sounds fade in, bioluminescent atmosphere)\n',
    build: '[Build]\n(organic textures layer up)\n',
    drop:  '[Drop]\n(twisted bassline erupts, forest energy unleashed)\n',
    breakdown: '[Breakdown]\n(shamanic chant, tribal percussion loop)\n',
    peak:  '[Peak]\n(all organic and synthetic elements fused)\n',
    outro: '[Outro]\n(return to forest ambience)\n'
  },
  goa: {
    intro: '[Intro]\n(sunrise atmosphere, distant cosmic tones)\n',
    build: '[Build]\n(melodic spirals begin ascending)\n',
    drop:  '[Drop]\n(full goa sunrise energy, melodic acid lines)\n',
    breakdown: '[Breakdown]\n(spiritual journey, mantra sample)\n',
    peak:  '[Peak]\n(cosmic ecstasy, all melodic layers peak)\n',
    outro: '[Outro]\n(peaceful resolution, ocean waves)\n'
  },
  progressive: {
    intro: '[Intro]\n(deep minimal groove establishes)\n',
    build: '[Build]\n(subtle layers accumulate)\n',
    drop:  '[Drop]\n(rolling bassline locks in, hypnotic loop)\n',
    breakdown: '[Breakdown]\n(stripped minimal, tension)\n',
    peak:  '[Peak]\n(full deep progressive journey)\n',
    outro: '[Outro]\n(gradual reduction, hypnotic fade)\n'
  },
  hitech: {
    intro: '[Intro]\n(industrial kick pattern, 2 bars)\n',
    build: '[Build]\n(cyber complexity accumulates)\n',
    drop:  '[Drop]\n(maximum BPM, hyper-mechanical precision)\n',
    breakdown: '[Breakdown]\n(brief mechanical pause)\n',
    peak:  '[Peak]\n(sonic overload, industrial peak)\n',
    outro: '[Outro]\n(power down sequence)\n'
  },
  default: {
    intro: '[Intro]\n(atmospheric build, 8 bars)\n',
    build: '[Build]\n(layers add, tension rises)\n',
    drop:  '[Drop]\n(full psytrance energy, kick+bass)\n',
    breakdown: '[Breakdown]\n(stripped back, FX space)\n',
    peak:  '[Peak]\n(everything at maximum)\n',
    outro: '[Outro]\n(gradual breakdown, fade)\n'
  }
};

// ============================================================
// GUARD RULES
// ============================================================
const GUARD_RULES = [
  { a: 'euphoric', b: 'ominous',     msg: 'euphoric + ominous conflict' },
  { a: 'lo-fi',    b: 'crisp',       msg: 'lo-fi + crisp mix conflict' },
  { a: 'hi-tech',  b: 'meditative',  msg: 'hi-tech + meditative tension' },
  { a: 'cosmic',   b: 'glitch',      msg: 'cosmic + glitch clutter' },
  { a: 'zenonesque', b: 'chaotic',   msg: 'zenonesque + chaotic conflict' }
];

// ============================================================
// STATE
// ============================================================
const state = {
  subgenre: 'dark',
  bpm: 148,
  sonic: new Set(),
  moods: new Set(),
  scale: 'Phrygian',
  mixTrait: 'huge low-end',
  visualFormat: 'midjourney',
  orchLayers: [],
  snapshots: [],
  userPresets: [],
  guardWarnings: []
};

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  buildSubgenreGrid();
  buildSonicToggles();
  buildMoodToggles();
  buildScaleSelect();
  buildMixTraitSelect();
  buildOrchestra();
  buildRegister();
  bindBPM();
  bindActions();
  bindTabs();
  updateAll();
  // PWA service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});

// ============================================================
// BUILD UI
// ============================================================
function buildSubgenreGrid() {
  const el = document.getElementById('subgenre-grid');
  if (!el) return;
  el.innerHTML = '';
  Object.entries(SUBGENRES).forEach(([id, g]) => {
    const btn = document.createElement('button');
    btn.className = 'genre-btn' + (state.subgenre === id ? ' active' : '');
    btn.dataset.id = id;
    btn.innerHTML = `${g.label}<span class="bpm-hint">${g.bpm[0]}–${g.bpm[1]}</span>`;
    btn.style.setProperty('--genre-color', g.color);
    btn.addEventListener('click', () => {
      state.subgenre = id;
      const bpmRange = SUBGENRES[id].bpm;
      state.bpm = Math.round((bpmRange[0] + bpmRange[1]) / 2);
      document.getElementById('bpm-slider').value = state.bpm;
      document.getElementById('bpm-value').textContent = state.bpm;
      buildSubgenreGrid();
      updateAll();
    });
    el.appendChild(btn);
  });
}

function buildSonicToggles() {
  const el = document.getElementById('sonic-toggles');
  if (!el) return;
  el.innerHTML = '';
  SONIC_ELEMENTS.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'toggle-btn' + (state.sonic.has(s.id) ? ' active' : '');
    btn.dataset.id = s.id;
    btn.textContent = s.label;
    btn.addEventListener('click', () => {
      if (state.sonic.has(s.id)) {
        state.sonic.delete(s.id);
      } else if (state.sonic.size < 4) {
        state.sonic.add(s.id);
      } else {
        showToast('Max 4 Sonic Elements!');
        return;
      }
      updateAll();
      buildSonicToggles();
    });
    el.appendChild(btn);
  });
}

function buildMoodToggles() {
  const el = document.getElementById('mood-toggles');
  if (!el) return;
  el.innerHTML = '';
  MOODS.forEach(m => {
    const btn = document.createElement('button');
    btn.className = 'toggle-btn' + (state.moods.has(m.id) ? ' active' : '');
    btn.dataset.id = m.id;
    btn.textContent = m.label;
    btn.addEventListener('click', () => {
      if (state.moods.has(m.id)) {
        state.moods.delete(m.id);
      } else if (state.moods.size < 2) {
        state.moods.add(m.id);
      } else {
        showToast('Max 2 Moods!');
        return;
      }
      updateAll();
      buildMoodToggles();
    });
    el.appendChild(btn);
  });
}

function buildScaleSelect() {
  const el = document.getElementById('scale-select');
  if (!el) return;
  SCALES.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s;
    if (s === state.scale) opt.selected = true;
    el.appendChild(opt);
  });
  el.addEventListener('change', () => { state.scale = el.value; updateAll(); });
}

function buildMixTraitSelect() {
  const el = document.getElementById('mix-select');
  if (!el) return;
  MIX_TRAITS.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t; opt.textContent = t;
    if (t === state.mixTrait) opt.selected = true;
    el.appendChild(opt);
  });
  el.addEventListener('change', () => { state.mixTrait = el.value; updateAll(); });
}

function bindBPM() {
  const slider = document.getElementById('bpm-slider');
  const valEl  = document.getElementById('bpm-value');
  if (!slider) return;
  slider.value = state.bpm;
  valEl.textContent = state.bpm;
  slider.addEventListener('input', () => {
    state.bpm = parseInt(slider.value);
    valEl.textContent = state.bpm;
    updateAll();
  });
}

function bindActions() {
  const btnMap = {
    'btn-randomize':      doRandomize,
    'btn-copy':           doCopy,
    'btn-copy-visual':    doCopyVisual,
    'btn-run-audit':      runAudit,
    'btn-snapshot':       doSnapshot,
    'btn-export-json':    doExportJSON,
    'btn-import-trigger': () => document.getElementById('import-input')?.click()
  };
  Object.entries(btnMap).forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  });
  const imp = document.getElementById('import-input');
  if (imp) imp.addEventListener('change', doImportJSON);
  const fmtBtns = document.querySelectorAll('[data-fmt]');
  fmtBtns.forEach(b => b.addEventListener('click', () => {
    state.visualFormat = b.dataset.fmt;
    fmtBtns.forEach(x => x.classList.toggle('active', x.dataset.fmt === state.visualFormat));
    updateVisualOutput();
  }));
}

function bindTabs() {
  document.querySelectorAll('.tab-btn, .bnav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      if (!target) return;
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.tab-btn, .bnav-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('panel-' + target)?.classList.add('active');
      document.querySelectorAll(`[data-tab="${target}"]`).forEach(b => b.classList.add('active'));
    });
  });
}

// ============================================================
// ORCHESTRA
// ============================================================
const ORCH_ROLES = ['Kick/Bass','Leads','Pads','FX/Atmo','Percussion','Stabs','Full Mix'];

function buildOrchestra() {
  const el = document.getElementById('orchestra-layers');
  if (!el) return;
  state.orchLayers = ORCH_ROLES.map((role, i) => ({ role, subgenre: 'dark', active: i < 3 }));
  renderOrchLayers();
  const addBtn = document.getElementById('btn-orch-add');
  if (addBtn) addBtn.addEventListener('click', () => {
    state.orchLayers.push({ role: 'Full Mix', subgenre: state.subgenre, active: true });
    renderOrchLayers();
  });
  const buildBtn = document.getElementById('btn-orch-build');
  if (buildBtn) buildBtn.addEventListener('click', buildOrchPrompt);
}

function renderOrchLayers() {
  const el = document.getElementById('orchestra-layers');
  if (!el) return;
  el.innerHTML = '';
  state.orchLayers.forEach((layer, i) => {
    const div = document.createElement('div');
    div.className = 'orchestra-layer';
    div.innerHTML = `
      <div class="orch-layer-header">
        <span class="orch-role-badge">Layer ${i+1}</span>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
          <input type="checkbox" ${layer.active ? 'checked' : ''} style="accent-color:var(--neon-purple)">
          <span style="font-family:var(--font-mono);font-size:0.62rem;color:var(--text-dim)">Active</span>
        </label>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <select style="flex:1;min-width:100px;" class="orch-role-sel">
          ${ORCH_ROLES.map(r => `<option ${r===layer.role?'selected':''}>${r}</option>`).join('')}
        </select>
        <select style="flex:1;min-width:100px;" class="orch-genre-sel">
          ${Object.entries(SUBGENRES).map(([id,g]) => `<option value="${id}" ${id===layer.subgenre?'selected':''}>${g.label}</option>`).join('')}
        </select>
      </div>`;
    div.querySelector('input').addEventListener('change', e => { layer.active = e.target.checked; });
    div.querySelector('.orch-role-sel').addEventListener('change', e => { layer.role = e.target.value; });
    div.querySelector('.orch-genre-sel').addEventListener('change', e => { layer.subgenre = e.target.value; });
    el.appendChild(div);
  });
}

function buildOrchPrompt() {
  const active = state.orchLayers.filter(l => l.active);
  if (!active.length) { showToast('Keine aktiven Layer!'); return; }
  const parts = active.map(l => {
    const g = SUBGENRES[l.subgenre];
    return `[${l.role}] ${g.tags.slice(0,2).join(', ')}`;
  });
  const txt = parts.join(' | ');
  const el = document.getElementById('orch-output');
  if (el) el.textContent = txt;
}

// ============================================================
// REGISTER (Factory Presets)
// ============================================================
const FACTORY_PRESETS = [
  { name: '666 Dark Ritual',  subgenre: 'dark',        bpm: 150, sonic: ['acid','glitch','drone'], moods: ['dark','ominous'],   scale: 'Phrygian' },
  { name: 'Deep Forest',      subgenre: 'forest',      bpm: 150, sonic: ['tribal','reverb','cosmic'], moods: ['mystical','tribal'], scale: 'Dorian' },
  { name: 'Goa Cosmic',       subgenre: 'goa',         bpm: 144, sonic: ['acid','arp','cosmic'],    moods: ['spiritual','cosmic'], scale: 'Lydian' },
  { name: 'Hi-Tech Hell',     subgenre: 'hi-tech',     bpm: 160, sonic: ['stab','glitch','808'],    moods: ['aggressive','chaotic'], scale: 'Locrian' },
  { name: 'Prog Deep',        subgenre: 'progressive', bpm: 140, sonic: ['drone','sidechain'],       moods: ['hypnotic','meditative'], scale: 'Dorian' },
  { name: 'Full-On Burst',    subgenre: 'full-on',     bpm: 145, sonic: ['acid','arp','sidechain','offbeat'], moods: ['euphoric','futuristic'], scale: 'Phrygian' }
];

function buildRegister() {
  renderFactoryPresets();
  const saveBtn = document.getElementById('btn-save-preset');
  if (saveBtn) saveBtn.addEventListener('click', doSavePreset);
}

function renderFactoryPresets() {
  const el = document.getElementById('factory-presets');
  if (!el) return;
  el.innerHTML = '';
  FACTORY_PRESETS.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.textContent = p.name;
    btn.addEventListener('click', () => loadPreset(p));
    el.appendChild(btn);
  });
}

function renderUserPresets() {
  const el = document.getElementById('user-presets');
  if (!el) return;
  el.innerHTML = '';
  if (!state.userPresets.length) {
    el.innerHTML = '<span class="text-muted font-mono" style="font-size:0.62rem">Keine gespeicherten Presets</span>';
    return;
  }
  state.userPresets.forEach((p, i) => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.textContent = p.name;
    btn.addEventListener('click', () => loadPreset(p));
    el.appendChild(btn);
  });
}

function loadPreset(p) {
  state.subgenre = p.subgenre;
  state.bpm = p.bpm;
  state.sonic = new Set(p.sonic || []);
  state.moods = new Set(p.moods || []);
  state.scale = p.scale || 'Phrygian';
  const slider = document.getElementById('bpm-slider');
  if (slider) { slider.value = state.bpm; document.getElementById('bpm-value').textContent = state.bpm; }
  buildSubgenreGrid();
  buildSonicToggles();
  buildMoodToggles();
  updateAll();
  showToast(`Preset: ${p.name}`);
}

function doSavePreset() {
  const nameEl = document.getElementById('preset-name-input');
  const name = nameEl?.value.trim() || `Preset ${state.userPresets.length + 1}`;
  state.userPresets.push({
    name, subgenre: state.subgenre, bpm: state.bpm,
    sonic: [...state.sonic], moods: [...state.moods], scale: state.scale
  });
  renderUserPresets();
  if (nameEl) nameEl.value = '';
  showToast('Preset gespeichert!');
}

// ============================================================
// PROMPT BUILDER
// ============================================================
function buildPrompt() {
  const g = SUBGENRES[state.subgenre];
  const sonicTags = SONIC_ELEMENTS.filter(s => state.sonic.has(s.id)).map(s => s.tag);
  const moodTags  = MOODS.filter(m => state.moods.has(m.id)).map(m => m.tag);
  const psycho = window.PSYCHO_TAGS ? [`psychoacoustic depth: ${window.PSYCHO_TAGS}`] : [];
  const parts = [
    `${g.label} psytrance`,
    `${state.bpm} BPM`,
    ...psycho,
    ...moodTags,
    ...g.tags.slice(0, 2),
    ...sonicTags,
    state.mixTrait,
    state.scale !== 'Phrygian' ? state.scale : ''
  ].filter(Boolean);
  let prompt = parts.join(', ');
  const STYLE_LIMIT = 1000;
  if (prompt.length > STYLE_LIMIT) {
    // Trim to 1000 chars at last comma
    prompt = prompt.substring(0, STYLE_LIMIT);
    const lastComma = prompt.lastIndexOf(',');
    if (lastComma > Math.floor(STYLE_LIMIT * 0.85)) prompt = prompt.substring(0, lastComma);
  }
  return prompt;
}

// ============================================================
// UPDATE ALL
// ============================================================
function updateAll() {
  runGuard();
  updatePromptOutput();
  updateVisualOutput();
  updateLyricOutput();
}

function updatePromptOutput() {
  const prompt = buildPrompt();
  const el = document.getElementById('prompt-output');
  const counter = document.getElementById('char-count');
  const STYLE_LIMIT = 1000;
  const warnAt = Math.floor(STYLE_LIMIT * 0.92);
  if (el) el.textContent = prompt;
  if (counter) {
    counter.textContent = `${prompt.length}/${STYLE_LIMIT}`;
    counter.className = 'char-counter ' + (prompt.length > STYLE_LIMIT ? 'char-over' : prompt.length > warnAt ? 'char-warn' : 'char-ok');
  }
}

function updateVisualOutput() {
  const g = SUBGENRES[state.subgenre];
  const moodStr = [...state.moods].map(m => MOODS.find(x => x.id === m)?.tag || m).join(', ');
  let prompt = '';
  if (state.visualFormat === 'midjourney') {
    prompt = `${g.visual}, ${moodStr || 'psychedelic'}, ultradetailed, neon glow, 8k --ar 16:9 --style raw`;
  } else if (state.visualFormat === 'flux') {
    prompt = `[FLUX] ${g.visual}. Mood: ${moodStr || 'psychedelic'}. Style: cyberpunk neon, ultradetailed digital art, dark background.`;
  } else {
    prompt = `(${g.visual}:1.3), ${moodStr || 'psychedelic atmosphere'}, neon glow, dark background, (masterpiece:1.2), 8k resolution`;
  }
  const el = document.getElementById('visual-output');
  if (el) el.textContent = prompt;
}

function updateLyricOutput() {
  const g = SUBGENRES[state.subgenre];
  const set = LYRIC_SETS[g.lyricSet] || LYRIC_SETS.default;
  const result = Object.values(set).join('\n');
  const el = document.getElementById('lyric-output');
  if (el) el.textContent = result;
}

// ============================================================
// GUARD SYSTEM
// ============================================================
function runGuard() {
  state.guardWarnings = [];
  const allActive = new Set([...state.moods, ...state.sonic, state.subgenre]);
  GUARD_RULES.forEach(rule => {
    if (allActive.has(rule.a) && allActive.has(rule.b)) {
      state.guardWarnings.push(rule.msg);
    }
  });
  const bar = document.getElementById('guard-bar');
  if (!bar) return;
  if (!state.guardWarnings.length) {
    bar.className = 'guard-bar guard-ok';
    bar.innerHTML = '✅ Guard: Keine Konflikte';
  } else if (state.guardWarnings.length === 1) {
    bar.className = 'guard-bar guard-warn';
    bar.innerHTML = `⚠️ Guard: ${state.guardWarnings[0]}`;
  } else {
    bar.className = 'guard-bar guard-error';
    bar.innerHTML = `🚫 Guard: ${state.guardWarnings.length} Konflikte — ${state.guardWarnings[0]}`;
  }
}

// ============================================================
// AUDIT SYSTEM
// ============================================================
function runAudit() {
  const prompt = buildPrompt();
  const checks = [];
  let score = 100;

  const subOk = !!state.subgenre;
  checks.push({ label: 'Subgenre gesetzt', pass: subOk, detail: state.subgenre || 'fehlt' });
  if (!subOk) score -= 20;

  const bpmOk = state.bpm >= 138 && state.bpm <= 165;
  checks.push({ label: 'BPM im Psytrance-Bereich', pass: bpmOk, detail: `${state.bpm} BPM` });
  if (!bpmOk) score -= 10;

  const STYLE_LIMIT = 1000;
  const charOk = prompt.length <= STYLE_LIMIT;
  const charWarn = prompt.length >= Math.floor(STYLE_LIMIT * 0.92);
  checks.push({ label: `Zeichenlimit (${prompt.length}/${STYLE_LIMIT})`, pass: charOk, warn: charWarn, detail: charOk ? 'OK' : 'Zu lang!' });
  if (!charOk) score -= 15;
  else if (charWarn) score -= 5;

  const moodOk = state.moods.size >= 1;
  checks.push({ label: 'Mind. 1 Mood', pass: moodOk, detail: `${state.moods.size} aktiv` });
  if (!moodOk) score -= 10;

  const sonicOk = state.sonic.size >= 1;
  checks.push({ label: 'Mind. 1 Sonic Element', pass: sonicOk, detail: `${state.sonic.size} aktiv` });
  if (!sonicOk) score -= 10;

  const hasBass = state.sonic.has('acid') || state.sonic.has('808') || state.sonic.has('offbeat') || state.sonic.has('sidechain');
  checks.push({ label: 'Bass-Tag vorhanden (Suno)', pass: hasBass, detail: hasBass ? 'OK' : 'Suno braucht expliziten Bass!' });
  if (!hasBass) score -= 15;

  const guardOk = state.guardWarnings.length === 0;
  checks.push({ label: 'Guard: Keine Konflikte', pass: guardOk, detail: guardOk ? 'Clean' : state.guardWarnings.join('; ') });
  if (!guardOk) score -= state.guardWarnings.length * 5;

  score = Math.max(0, Math.min(100, score));
  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 55 ? 'C' : 'D';
  const gradeColor = { A: '#00ff9d', B: '#00e5ff', C: '#ffe000', D: '#ff2d78' }[grade];

  const scoreEl = document.getElementById('audit-score');
  const gradeEl = document.getElementById('audit-grade');
  const listEl  = document.getElementById('audit-list');
  if (scoreEl) { scoreEl.textContent = score; scoreEl.style.color = gradeColor; }
  if (gradeEl) { gradeEl.textContent = `Grade: ${grade}`; gradeEl.style.color = gradeColor; }
  if (listEl) {
    listEl.innerHTML = checks.map(c => `
      <li>
        <span>${c.label}</span>
        <span class="${c.pass ? 'audit-pass' : (c.warn ? 'audit-warn' : 'audit-fail')}">
          ${c.pass ? '✓' : (c.warn ? '⚠' : '✗')} ${c.detail}
        </span>
      </li>`).join('');
  }
}

// ============================================================
// ACTIONS
// ============================================================
function doRandomize() {
  const genres = Object.keys(SUBGENRES);
  state.subgenre = genres[Math.floor(Math.random() * genres.length)];
  const bpmRange = SUBGENRES[state.subgenre].bpm;
  state.bpm = bpmRange[0] + Math.floor(Math.random() * (bpmRange[1] - bpmRange[0] + 1));
  state.sonic.clear();
  state.moods.clear();
  const sonicPool = [...SONIC_ELEMENTS].sort(() => Math.random() - 0.5).slice(0, 3);
  sonicPool.forEach(s => state.sonic.add(s.id));
  const moodPool = [...MOODS].sort(() => Math.random() - 0.5).slice(0, 2);
  moodPool.forEach(m => state.moods.add(m.id));
  // Auto-fix guard
  GUARD_RULES.forEach(rule => {
    if (state.moods.has(rule.a) && state.moods.has(rule.b)) state.moods.delete(rule.b);
    if (state.sonic.has(rule.a) && state.sonic.has(rule.b)) state.sonic.delete(rule.b);
  });
  const slider = document.getElementById('bpm-slider');
  if (slider) { slider.value = state.bpm; document.getElementById('bpm-value').textContent = state.bpm; }
  buildSubgenreGrid();
  buildSonicToggles();
  buildMoodToggles();
  updateAll();
  showToast('🎲 Randomized!');
}

function doCopy() {
  const prompt = buildPrompt();
  navigator.clipboard.writeText(prompt).then(() => showToast('Prompt kopiert!')).catch(() => {
    const el = document.getElementById('prompt-output');
    if (el) { el.select?.(); document.execCommand('copy'); }
    showToast('Prompt kopiert!');
  });
}

function doCopyVisual() {
  const el = document.getElementById('visual-output');
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(() => showToast('Visual Prompt kopiert!')).catch(() => showToast('Fehler beim Kopieren'));
}

function doSnapshot() {
  const snap = {
    ts: new Date().toISOString(),
    subgenre: state.subgenre, bpm: state.bpm,
    sonic: [...state.sonic], moods: [...state.moods],
    scale: state.scale, mixTrait: state.mixTrait,
    prompt: buildPrompt()
  };
  state.snapshots.unshift(snap);
  if (state.snapshots.length > 10) state.snapshots.pop();
  renderSnapshots();
  showToast('Snapshot gespeichert!');
}

function renderSnapshots() {
  const el = document.getElementById('snapshot-list');
  if (!el) return;
  el.innerHTML = '';
  if (!state.snapshots.length) { el.innerHTML = '<span class="text-muted font-mono" style="font-size:0.62rem">Keine Snapshots</span>'; return; }
  state.snapshots.forEach((s, i) => {
    const div = document.createElement('div');
    div.style.cssText = 'padding:8px;border:1px solid var(--border);border-radius:6px;margin-bottom:6px;cursor:pointer;';
    div.innerHTML = `<div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--text-muted)">${new Date(s.ts).toLocaleTimeString()}</div>
      <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--neon-cyan);margin-top:4px">${s.prompt.substring(0,60)}…</div>`;
    div.addEventListener('click', () => {
      loadPreset(s);
      showToast(`Snapshot ${i+1} geladen`);
    });
    el.appendChild(div);
  });
}

function doExportJSON() {
  const data = {
    version: '1.0', ts: new Date().toISOString(),
    state: { subgenre: state.subgenre, bpm: state.bpm, sonic: [...state.sonic], moods: [...state.moods], scale: state.scale, mixTrait: state.mixTrait },
    snapshots: state.snapshots, userPresets: state.userPresets
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = '666-sounds-session.json'; a.click();
  URL.revokeObjectURL(url);
  showToast('JSON exportiert!');
}

function doImportJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (data.state) loadPreset(data.state);
      if (data.snapshots) state.snapshots = data.snapshots;
      if (data.userPresets) { state.userPresets = data.userPresets; renderUserPresets(); }
      renderSnapshots();
      showToast('Session importiert!');
    } catch { showToast('JSON Fehler!'); }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// ============================================================
// TOAST
// ============================================================
let toastTimer = null;
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// Expose globals for matrix.js / psycho.js / engine4d.js
window.APP_STATE = state;
window.APP_SUBGENRES = SUBGENRES;
window.APP_SONIC = SONIC_ELEMENTS;
window.APP_MOODS = MOODS;
window.APP_buildPrompt = buildPrompt;
window.APP_showToast = showToast;

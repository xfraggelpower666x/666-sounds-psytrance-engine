/* ============================================================
   666 SOUNDS DESIGN — psycho.js
   Psychoakustik Engine: Binaural + Haas + Isochronic + Room
   ============================================================ */

'use strict';

const PSYCHO_PROFILES = {
  trance:     { name: 'Trance',      hz: 6,     band: 'theta',  desc: 'Tiefe Trance, 6Hz Theta — Flow-State-Auslöser' },
  flow:       { name: 'Flow',        hz: 10,    band: 'alpha',  desc: 'Alpha-Flow, 10Hz — Relaxed Focus' },
  hypnose:    { name: 'Hypnose',     hz: 3.5,   band: 'delta',  desc: 'Delta/Theta 3.5Hz — Tiefhypnose' },
  ekstase:    { name: 'Ekstase',     hz: 40,    band: 'gamma',  desc: 'Gamma 40Hz — Peak Experience, Euphorie' },
  meditation: { name: 'Meditation',  hz: 5,     band: 'theta',  desc: 'Theta 5Hz — Tiefe Meditation' },
  ritual:     { name: 'Ritual',      hz: 7.83,  band: 'schumann', desc: 'Schumann 7.83Hz — Erdresonanz' }
};

const ROOM_PRESETS = {
  tight:   { name: 'Tight Studio',  rt60: 0.3,  decay: 'short',  tag: 'tight dry studio' },
  club:    { name: 'Club',          rt60: 0.8,  decay: 'medium', tag: 'club room reverb' },
  cave:    { name: 'Cave',          rt60: 2.5,  decay: 'long',   tag: 'deep cave reverb' },
  cosmic:  { name: 'Cosmic Void',   rt60: 8.0,  decay: 'infinite', tag: 'infinite cosmic space reverb' }
};

const HAAS_ZONES = [
  { min: 1,   max: 5,   zone: 'Fusion',     effect: 'Mono-kompatibel, Stereo-Erweiterung' },
  { min: 6,   max: 15,  zone: 'Presence',   effect: 'Haas-Zone: Space ohne Echo' },
  { min: 16,  max: 25,  zone: 'Width',      effect: 'Maximale Stereobreite' },
  { min: 26,  max: 35,  zone: 'Pre-Echo',   effect: 'Grenze: leichtes Pre-Echo hörbar' }
];

// ============================================================
// STATE
// ============================================================
const psychoState = {
  profile:    'trance',
  carrier:    200,
  haasDelay:  12,
  isoEnabled: true,
  roomPreset: 'club',
  effects: new Set(['binaural', 'haas', 'isochronic', 'room']),
  animFrame:  null
};

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  buildProfileGrid();
  buildRoomSelect();
  buildEffectToggles();
  buildHaasSlider();
  buildCarrierSlider();
  startPsychoCanvas();
  updatePsychoOutput();
  bindPsychoActions();
});

// ============================================================
// PROFILE GRID
// ============================================================
function buildProfileGrid() {
  const el = document.getElementById('psycho-profile-grid');
  if (!el) return;
  el.innerHTML = '';
  Object.entries(PSYCHO_PROFILES).forEach(([id, p]) => {
    const btn = document.createElement('button');
    btn.className = 'genre-btn' + (psychoState.profile === id ? ' active' : '');
    btn.innerHTML = `${p.name}<span class="bpm-hint">${p.hz}Hz ${p.band}</span>`;
    btn.addEventListener('click', () => {
      psychoState.profile = id;
      buildProfileGrid();
      updatePsychoInfo();
      updatePsychoOutput();
    });
    el.appendChild(btn);
  });
}

function updatePsychoInfo() {
  const p = PSYCHO_PROFILES[psychoState.profile];
  const infoEl = document.getElementById('psycho-profile-desc');
  if (infoEl) infoEl.textContent = p.desc;
  // Binaural calc
  const carrier = psychoState.carrier;
  const beat    = p.hz;
  document.getElementById('psycho-carrier-l')  && (document.getElementById('psycho-carrier-l').textContent = `${carrier} Hz`);
  document.getElementById('psycho-carrier-r')  && (document.getElementById('psycho-carrier-r').textContent = `${(carrier + beat).toFixed(2)} Hz`);
  document.getElementById('psycho-beat-freq')  && (document.getElementById('psycho-beat-freq').textContent = `${beat} Hz`);
  // Isochronic calc
  const period   = (1000 / beat).toFixed(0);
  const pulseOn  = (period * 0.5).toFixed(0);
  const bpmEq    = (beat * 60).toFixed(1);
  document.getElementById('iso-period')   && (document.getElementById('iso-period').textContent   = `${period} ms`);
  document.getElementById('iso-pulse')    && (document.getElementById('iso-pulse').textContent    = `${pulseOn} ms`);
  document.getElementById('iso-bpm-eq')  && (document.getElementById('iso-bpm-eq').textContent   = `${bpmEq} BPM`);
  // Haas
  updateHaasInfo();
}

// ============================================================
// HAAS SLIDER
// ============================================================
function buildHaasSlider() {
  const slider = document.getElementById('haas-slider');
  const valEl  = document.getElementById('haas-value');
  if (!slider) return;
  slider.value = psychoState.haasDelay;
  valEl && (valEl.textContent = psychoState.haasDelay + ' ms');
  slider.addEventListener('input', () => {
    psychoState.haasDelay = parseInt(slider.value);
    if (valEl) valEl.textContent = psychoState.haasDelay + ' ms';
    updateHaasInfo();
    updatePsychoOutput();
  });
}

function updateHaasInfo() {
  const delay = psychoState.haasDelay;
  const zone = HAAS_ZONES.find(z => delay >= z.min && delay <= z.max);
  const zoneEl   = document.getElementById('haas-zone');
  const effectEl = document.getElementById('haas-effect');
  if (zoneEl)   zoneEl.textContent   = zone ? zone.zone : '—';
  if (effectEl) effectEl.textContent = zone ? zone.effect : '—';
}

// ============================================================
// CARRIER SLIDER
// ============================================================
function buildCarrierSlider() {
  const slider = document.getElementById('carrier-slider');
  const valEl  = document.getElementById('carrier-value');
  if (!slider) return;
  slider.value = psychoState.carrier;
  if (valEl) valEl.textContent = psychoState.carrier + ' Hz';
  slider.addEventListener('input', () => {
    psychoState.carrier = parseInt(slider.value);
    if (valEl) valEl.textContent = psychoState.carrier + ' Hz';
    updatePsychoInfo();
    updatePsychoOutput();
  });
  updatePsychoInfo();
}

// ============================================================
// ROOM SELECT
// ============================================================
function buildRoomSelect() {
  const el = document.getElementById('room-select');
  if (!el) return;
  Object.entries(ROOM_PRESETS).forEach(([id, r]) => {
    const opt = document.createElement('option');
    opt.value = id; opt.textContent = `${r.name} (RT60: ${r.rt60}s)`;
    if (id === psychoState.roomPreset) opt.selected = true;
    el.appendChild(opt);
  });
  el.addEventListener('change', () => {
    psychoState.roomPreset = el.value;
    updateRoomInfo();
    updatePsychoOutput();
  });
  updateRoomInfo();
}

function updateRoomInfo() {
  const r = ROOM_PRESETS[psychoState.roomPreset];
  const el = document.getElementById('room-info');
  if (el) el.textContent = `RT60: ${r.rt60}s — ${r.decay} decay`;
}

// ============================================================
// EFFECT TOGGLES
// ============================================================
function buildEffectToggles() {
  const effects = ['binaural', 'haas', 'isochronic', 'room'];
  const labels  = { binaural: 'Binaural Beats', haas: 'Haas Effect', isochronic: 'Isochronic', room: 'Room Acoustics' };
  const el = document.getElementById('psycho-effect-toggles');
  if (!el) return;
  el.innerHTML = '';
  effects.forEach(id => {
    const btn = document.createElement('button');
    btn.className = 'toggle-btn' + (psychoState.effects.has(id) ? ' active' : '');
    btn.textContent = labels[id];
    btn.addEventListener('click', () => {
      if (psychoState.effects.has(id)) psychoState.effects.delete(id);
      else psychoState.effects.add(id);
      buildEffectToggles();
      updatePsychoOutput();
    });
    el.appendChild(btn);
  });
}

// ============================================================
// OUTPUT
// ============================================================
function updatePsychoOutput() {
  const p = PSYCHO_PROFILES[psychoState.profile];
  const tags = [];
  if (psychoState.effects.has('binaural'))   tags.push(`binaural ${p.hz}Hz ${p.band}`);
  if (psychoState.effects.has('haas'))       tags.push(`Haas stereo ${psychoState.haasDelay}ms`);
  if (psychoState.effects.has('isochronic')) tags.push(`isochronic ${p.hz}Hz pulse`);
  if (psychoState.effects.has('room'))       tags.push(ROOM_PRESETS[psychoState.roomPreset].tag);

  const el = document.getElementById('psycho-output');
  if (el) {
    el.textContent = tags.join(', ');
    const counter = document.getElementById('psycho-char-count');
    if (counter) {
      const len = tags.join(', ').length;
      counter.textContent = `${len} chars`;
      counter.className = 'char-counter ' + (len > 60 ? 'char-warn' : 'char-ok');
    }
  }
  // Expose for matrix
  window.PSYCHO_TAGS = tags.join(', ');
}

function bindPsychoActions() {
  const copyBtn = document.getElementById('btn-copy-psycho');
  if (copyBtn) copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(window.PSYCHO_TAGS || '').then(() => {
      if (window.APP_showToast) window.APP_showToast('Psycho-Tags kopiert!');
    });
  });
}

// ============================================================
// CANVAS VISUALIZER
// ============================================================
function startPsychoCanvas() {
  const canvas = document.getElementById('psycho-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight || 140;
  }
  resize();
  new ResizeObserver(resize).observe(canvas);

  function draw() {
    psychoState.animFrame = requestAnimationFrame(draw);
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#03030a';
    ctx.fillRect(0, 0, W, H);

    const p = PSYCHO_PROFILES[psychoState.profile];
    const beatHz = p.hz;

    // Left channel (carrier)
    ctx.beginPath();
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < W; x++) {
      const phase = (x / W) * Math.PI * 4 + t;
      const y = H * 0.3 + Math.sin(phase) * (H * 0.22);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Right channel (carrier + beat)
    ctx.beginPath();
    ctx.strokeStyle = '#c92fff';
    ctx.lineWidth = 1.5;
    const freqRatio = (psychoState.carrier + beatHz) / psychoState.carrier;
    for (let x = 0; x < W; x++) {
      const phase = (x / W) * Math.PI * 4 * freqRatio + t;
      const y = H * 0.7 + Math.sin(phase) * (H * 0.22);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Isochronic pulse overlay
    if (psychoState.effects.has('isochronic')) {
      const pulsePhase = Math.sin(t * beatHz * 0.3);
      if (pulsePhase > 0) {
        ctx.fillStyle = `rgba(255,224,0,${pulsePhase * 0.08})`;
        ctx.fillRect(0, 0, W, H);
      }
    }

    // Labels
    ctx.fillStyle = '#44446a';
    ctx.font = '10px Share Tech Mono, monospace';
    ctx.fillText(`L: ${psychoState.carrier}Hz`, 6, 14);
    ctx.fillText(`R: ${(psychoState.carrier + beatHz).toFixed(1)}Hz`, 6, H - 6);
    ctx.fillText(`Δ: ${beatHz}Hz (${p.band})`, W/2 - 40, H/2 + 4);

    t += 0.03;
  }
  draw();
}

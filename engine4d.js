/* ============================================================
   666 SOUNDS DESIGN — engine4d.js
   4D Akustik Engine: XY-Pad + Ambisonics + Doppler + Motion
   ============================================================ */

'use strict';

const MOTION_PATHS = {
  static:    { name: 'Static',    desc: 'Kein Movement' },
  orbit:     { name: 'Orbit',     desc: 'Kreisförmig um Listener' },
  spiral:    { name: 'Spiral',    desc: 'Spirale nach außen' },
  pendulum:  { name: 'Pendulum',  desc: 'Links-Rechts Pendel' },
  lissajous: { name: 'Lissajous', desc: 'Lissajous-Figur (XY)' },
  ascent:    { name: 'Ascent',    desc: 'Aufstieg Z-Achse' },
  vortex:    { name: 'Vortex',    desc: 'Spirale + Aufstieg' },
  quantum:   { name: 'Quantum',   desc: 'Zufällige Quantensprünge' }
};

const AMBISONIC_ORDERS = [
  { value: 0, label: 'Stereo',     channels: 2,  tag: 'stereo field' },
  { value: 1, label: 'FOA (1st)', channels: 4,  tag: '1st order ambisonics' },
  { value: 2, label: 'SOA (2nd)', channels: 9,  tag: '2nd order ambisonics' },
  { value: 3, label: 'TOA (3rd)', channels: 16, tag: '3rd order ambisonics' }
];

const DEPTH_LAYERS = [
  { id: 'near',    label: 'Near (0.1–2m)',   tag: 'close proximity sound' },
  { id: 'mid',     label: 'Mid (2–6m)',       tag: 'mid-field placement' },
  { id: 'far',     label: 'Far (6–15m)',      tag: 'distant spatial cue' },
  { id: 'cosmic',  label: 'Cosmic (15m+)',    tag: 'infinite cosmic distance' }
];

const DOPPLER_SPEEDS = [
  { id: 'none',    label: 'None',   speed: 0,   tag: '' },
  { id: 'slow',    label: 'Slow',   speed: 5,   tag: 'slow Doppler shift' },
  { id: 'medium',  label: 'Medium', speed: 20,  tag: 'Doppler pitch sweep' },
  { id: 'fast',    label: 'Fast',   speed: 60,  tag: 'fast Doppler fly-by' },
  { id: 'extreme', label: 'Extreme',speed: 120, tag: 'extreme Doppler warp' }
];

const PRESETS_4D = [
  { name: 'Orbit Bass',    azimuth: 0,  elevation: -30, z: 3,  motion: 'orbit',     ambOrder: 1, depth: 'mid',   doppler: 'slow' },
  { name: 'Cosmic Lead',   azimuth: 45, elevation: 60,  z: 15, motion: 'ascent',    ambOrder: 3, depth: 'cosmic',doppler: 'none' },
  { name: 'Vortex Drop',   azimuth: -90,elevation: 0,   z: 5,  motion: 'vortex',    ambOrder: 2, depth: 'far',   doppler: 'medium' },
  { name: 'Pendulum Pad',  azimuth: 0,  elevation: 0,   z: 2,  motion: 'pendulum',  ambOrder: 1, depth: 'mid',   doppler: 'slow' },
  { name: 'Quantum FX',    azimuth: 180,elevation: -60, z: 8,  motion: 'quantum',   ambOrder: 3, depth: 'far',   doppler: 'fast' },
  { name: 'Spiral Rise',   azimuth: 90, elevation: 30,  z: 1,  motion: 'spiral',    ambOrder: 2, depth: 'near',  doppler: 'none' }
];

// ============================================================
// STATE
// ============================================================
const state4D = {
  azimuth:   0,
  elevation: 0,
  z:         3,
  motion:    'orbit',
  ambOrder:  1,
  depth:     'mid',
  doppler:   'slow',
  speed:     20,
  animFrame: null,
  motionTime: 0,
  motionActive: false
};

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  buildMotionGrid();
  buildAmbOrderGrid();
  buildDepthGrid();
  buildDopplerGrid();
  build4DPresets();
  bindXYPad();
  bindZSlider();
  start4DCanvas();
  bind4DActions();
  update4DOutput();
});

// ============================================================
// MOTION GRID
// ============================================================
function buildMotionGrid() {
  const el = document.getElementById('motion-grid');
  if (!el) return;
  el.innerHTML = '';
  Object.entries(MOTION_PATHS).forEach(([id, m]) => {
    const btn = document.createElement('button');
    btn.className = 'toggle-btn' + (state4D.motion === id ? ' active' : '');
    btn.innerHTML = `${m.name}<span class="bpm-hint">${m.desc}</span>`;
    btn.style.fontSize = '0.6rem';
    btn.addEventListener('click', () => {
      state4D.motion = id;
      buildMotionGrid();
      update4DOutput();
    });
    el.appendChild(btn);
  });
}

// ============================================================
// AMBISONICS ORDER
// ============================================================
function buildAmbOrderGrid() {
  const el = document.getElementById('amb-order-grid');
  if (!el) return;
  el.innerHTML = '';
  AMBISONIC_ORDERS.forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'genre-btn' + (state4D.ambOrder === a.value ? ' active' : '');
    btn.innerHTML = `${a.label}<span class="bpm-hint">${a.channels}ch</span>`;
    btn.addEventListener('click', () => {
      state4D.ambOrder = a.value;
      buildAmbOrderGrid();
      updateAmbisonicsInfo();
      update4DOutput();
    });
    el.appendChild(btn);
  });
  updateAmbisonicsInfo();
}

function updateAmbisonicsInfo() {
  const a = AMBISONIC_ORDERS.find(x => x.value === state4D.ambOrder);
  const el = document.getElementById('amb-info');
  if (el && a) el.textContent = `${a.channels} Channels — Tag: "${a.tag}"`;
}

// ============================================================
// DEPTH GRID
// ============================================================
function buildDepthGrid() {
  const el = document.getElementById('depth-grid');
  if (!el) return;
  el.innerHTML = '';
  DEPTH_LAYERS.forEach(d => {
    const btn = document.createElement('button');
    btn.className = 'toggle-btn' + (state4D.depth === d.id ? ' active' : '');
    btn.textContent = d.label;
    btn.addEventListener('click', () => {
      state4D.depth = d.id;
      buildDepthGrid();
      update4DOutput();
    });
    el.appendChild(btn);
  });
}

// ============================================================
// DOPPLER GRID
// ============================================================
function buildDopplerGrid() {
  const el = document.getElementById('doppler-grid');
  if (!el) return;
  el.innerHTML = '';
  DOPPLER_SPEEDS.forEach(d => {
    const btn = document.createElement('button');
    btn.className = 'toggle-btn' + (state4D.doppler === d.id ? ' active' : '');
    btn.textContent = d.label;
    btn.addEventListener('click', () => {
      state4D.doppler = d.id;
      buildDopplerGrid();
      update4DOutput();
    });
    el.appendChild(btn);
  });
}

// ============================================================
// 4D PRESETS
// ============================================================
function build4DPresets() {
  const el = document.getElementById('presets-4d');
  if (!el) return;
  el.innerHTML = '';
  PRESETS_4D.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.textContent = p.name;
    btn.addEventListener('click', () => load4DPreset(p));
    el.appendChild(btn);
  });
}

function load4DPreset(p) {
  Object.assign(state4D, p);
  buildMotionGrid();
  buildAmbOrderGrid();
  buildDepthGrid();
  buildDopplerGrid();
  updateXYDot();
  update4DOutput();
  if (window.APP_showToast) window.APP_showToast(`4D Preset: ${p.name}`);
}

// ============================================================
// XY PAD
// ============================================================
function bindXYPad() {
  const pad = document.getElementById('xy-pad');
  if (!pad) return;
  let dragging = false;

  function setFromEvent(e) {
    const rect = pad.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top)  / rect.height));
    state4D.azimuth   = Math.round((x * 360) - 180);
    state4D.elevation = Math.round(90 - (y * 180));
    updateXYDot();
    update4DOutput();
    updateSpatialCalc();
  }

  pad.addEventListener('mousedown',  e => { dragging = true; setFromEvent(e); });
  pad.addEventListener('mousemove',  e => { if (dragging) setFromEvent(e); });
  pad.addEventListener('mouseup',    () => dragging = false);
  pad.addEventListener('mouseleave', () => dragging = false);
  pad.addEventListener('touchstart', e => { e.preventDefault(); setFromEvent(e); }, { passive: false });
  pad.addEventListener('touchmove',  e => { e.preventDefault(); setFromEvent(e); }, { passive: false });
}

function updateXYDot() {
  const dot = document.getElementById('xy-dot');
  if (!dot) return;
  const xPct = ((state4D.azimuth + 180) / 360) * 100;
  const yPct = ((90 - state4D.elevation) / 180) * 100;
  dot.style.left = `${xPct}%`;
  dot.style.top  = `${yPct}%`;
  const azEl = document.getElementById('xy-azimuth');
  const elEl = document.getElementById('xy-elevation');
  if (azEl) azEl.textContent = `Az: ${state4D.azimuth}°`;
  if (elEl) elEl.textContent = `El: ${state4D.elevation}°`;
}

// ============================================================
// Z SLIDER
// ============================================================
function bindZSlider() {
  const slider = document.getElementById('z-slider');
  const valEl  = document.getElementById('z-value');
  if (!slider) return;
  slider.value = state4D.z;
  if (valEl) valEl.textContent = `${state4D.z}m`;
  slider.addEventListener('input', () => {
    state4D.z = parseFloat(slider.value);
    if (valEl) valEl.textContent = `${state4D.z}m`;
    update4DOutput();
    updateSpatialCalc();
  });
}

// ============================================================
// SPATIAL CALCULATIONS
// ============================================================
function updateSpatialCalc() {
  // ILD (Interaural Level Difference)
  const ild = (Math.sin(state4D.azimuth * Math.PI / 180) * 6).toFixed(1);
  // ITD (Interaural Time Difference)
  const headRadius = 0.0875; // meters
  const c = 343; // speed of sound
  const itd = ((headRadius / c) * (state4D.azimuth * Math.PI / 180 + Math.sin(state4D.azimuth * Math.PI / 180)) * 1000).toFixed(3);
  // Air absorption at 1kHz (approx 0.002 dB/m)
  const airAbs = (state4D.z * 0.002).toFixed(3);
  // Doppler pitch shift
  const dopplerSpeed = DOPPLER_SPEEDS.find(d => d.id === state4D.doppler)?.speed || 0;
  const dopplerRatio = dopplerSpeed > 0 ? (343 / (343 - dopplerSpeed)).toFixed(4) : '1.0000';

  // B-Format (Ambisonics)
  const az = state4D.azimuth * Math.PI / 180;
  const el = state4D.elevation * Math.PI / 180;
  const W = 0.707.toFixed(3);
  const X = (Math.cos(az) * Math.cos(el)).toFixed(3);
  const Y = (Math.sin(az) * Math.cos(el)).toFixed(3);
  const Z = Math.sin(el).toFixed(3);

  const setVal = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  setVal('calc-ild',     `${ild} dB`);
  setVal('calc-itd',     `${itd} ms`);
  setVal('calc-air',     `${airAbs} dB`);
  setVal('calc-doppler', `×${dopplerRatio}`);
  setVal('calc-W', W); setVal('calc-X', X);
  setVal('calc-Y', Y); setVal('calc-Z', Z);
}

// ============================================================
// OUTPUT
// ============================================================
function update4DOutput() {
  const parts = [];
  const motion = MOTION_PATHS[state4D.motion];
  const ambOrder = AMBISONIC_ORDERS.find(a => a.value === state4D.ambOrder);
  const depth = DEPTH_LAYERS.find(d => d.id === state4D.depth);
  const doppler = DOPPLER_SPEEDS.find(d => d.id === state4D.doppler);

  parts.push(`az${state4D.azimuth}° el${state4D.elevation}° z${state4D.z}m`);
  parts.push(`${motion.name.toLowerCase()} motion`);
  if (ambOrder.value > 0) parts.push(ambOrder.tag);
  if (depth) parts.push(depth.tag);
  if (doppler && doppler.tag) parts.push(doppler.tag);

  const tagStr = parts.join(', ');
  const el = document.getElementById('out-4d');
  if (el) el.textContent = tagStr;
  const counter = document.getElementById('char-4d');
  if (counter) {
    counter.textContent = `${tagStr.length} chars`;
    counter.className = 'char-counter ' + (tagStr.length > 60 ? 'char-warn' : 'char-ok');
  }

  window.ENGINE_4D_TAGS = tagStr;
  updateSpatialCalc();
  updateXYDot();
}

function bind4DActions() {
  const copyBtn = document.getElementById('btn-copy-4d');
  if (copyBtn) copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(window.ENGINE_4D_TAGS || '').then(() => {
      if (window.APP_showToast) window.APP_showToast('4D-Tags kopiert!');
    });
  });

  const motionToggle = document.getElementById('btn-motion-toggle');
  if (motionToggle) motionToggle.addEventListener('click', () => {
    state4D.motionActive = !state4D.motionActive;
    motionToggle.textContent = state4D.motionActive ? '⏹ Stop Motion' : '▶ Motion Start';
    motionToggle.className = state4D.motionActive ? 'btn btn-sm btn-pink' : 'btn btn-sm btn-secondary';
  });
}

// ============================================================
// 4D CANVAS
// ============================================================
function start4DCanvas() {
  const canvas = document.getElementById('canvas-4d');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight || 200;
  }
  resize();
  new ResizeObserver(resize).observe(canvas);

  const trail = [];
  const MAX_TRAIL = 60;

  function computePosition(time) {
    const motion = state4D.motion;
    const speed = 0.02;
    let az = state4D.azimuth, el = state4D.elevation;
    if (!state4D.motionActive) return { az, el };
    switch (motion) {
      case 'orbit':     az = (time * 40) % 360 - 180; break;
      case 'spiral':    az = (time * 30) % 360 - 180; el = Math.min(90, time * 5 - 90); break;
      case 'pendulum':  az = Math.sin(time * speed * 5) * 90; break;
      case 'lissajous': az = Math.sin(time * speed * 3) * 90; el = Math.sin(time * speed * 2) * 45; break;
      case 'ascent':    el = Math.min(90, (time % 30) * 6 - 90); break;
      case 'vortex':    az = (time * 50) % 360 - 180; el = Math.sin(time * 0.05) * 60; break;
      case 'quantum':   if (Math.floor(time) % 2 === 0) { az = (Math.random() * 360) - 180; el = (Math.random() * 180) - 90; } break;
    }
    return { az, el };
  }

  function draw() {
    state4D.animFrame = requestAnimationFrame(draw);
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#03030a';
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const radius = Math.min(cx, cy) - 20;

    // HOA rings
    const ambOrder = state4D.ambOrder;
    for (let o = 1; o <= ambOrder + 1; o++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (radius / (ambOrder + 2)) * o, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(201,47,255,${0.08 * (ambOrder + 2 - o) + 0.05})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx - radius, cy); ctx.lineTo(cx + radius, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - radius); ctx.lineTo(cx, cy + radius); ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#2a2a5a';
    ctx.font = '9px Share Tech Mono, monospace';
    ctx.fillText('L', cx - radius - 12, cy + 3);
    ctx.fillText('R', cx + radius + 4,  cy + 3);
    ctx.fillText('↑', cx - 4, cy - radius - 4);
    ctx.fillText('↓', cx - 4, cy + radius + 12);

    // Current position
    const pos = computePosition(t);
    if (state4D.motionActive) { t += 1; }
    const azRad = (pos.az + 90) * Math.PI / 180;
    const elScale = (pos.el + 90) / 180;
    const posX = cx + Math.cos(azRad) * radius * (1 - elScale * 0.3);
    const posY = cy - Math.sin(azRad) * radius * (1 - elScale * 0.3) * 0.7;

    // Trail
    trail.push({ x: posX, y: posY });
    if (trail.length > MAX_TRAIL) trail.shift();
    for (let i = 1; i < trail.length; i++) {
      const alpha = i / trail.length;
      ctx.beginPath();
      ctx.moveTo(trail[i-1].x, trail[i-1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.strokeStyle = `rgba(0,229,255,${alpha * 0.5})`;
      ctx.lineWidth = alpha * 2;
      ctx.stroke();
    }

    // Z indicator (size)
    const zScale = Math.max(0.3, 1 - state4D.z / 25);
    const dotR = 6 + zScale * 10;
    ctx.beginPath();
    ctx.arc(posX, posY, dotR, 0, Math.PI * 2);
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Position text
    ctx.fillStyle = '#7878aa';
    ctx.font = '9px Share Tech Mono, monospace';
    ctx.fillText(`Az:${Math.round(pos.az)}° El:${Math.round(pos.el)}° Z:${state4D.z}m`, 6, H - 6);
  }
  draw();
}

/* ============================================================
   666 SOUNDS DESIGN — lyric.engine.js
   Lyrik Engine: 3 Modi + OpenAI GPT-4o + Extended Prompt Builder

   MODI:
   1. MANUAL   — Eigene Lyrik direkt eingeben/bearbeiten
   2. AI-GEN   — Stichworte → GPT-4o generiert vollständige Lyrik
   3. IMAGE     — Bild hochladen → GPT-4o Vision analysiert → Lyrik

   ARCHITEKTUR:
   - OpenAI API-Key sicher in localStorage (nie im Code)
   - GPT-4o-mini für Text-Generierung (günstig, schnell)
   - GPT-4o für Bild-Analyse (Vision-fähig)
   - Generierte Lyrik → Suno-optimiert mit Section-Tags
   - Extended Prompt Builder nutzt Lyrik-Direktiven als Hebel
   ============================================================ */

'use strict';

// ============================================================
// API KEY MANAGEMENT (localStorage — never in code)
// ============================================================

const OPENAI_KEY_STORAGE = '666sounds_openai_key';

const LyricKeyManager = {
  get() {
    return localStorage.getItem(OPENAI_KEY_STORAGE) || '';
  },
  set(key) {
    if (!key.startsWith('sk-')) throw new Error('Kein gültiger OpenAI-Key (muss mit sk- beginnen)');
    localStorage.setItem(OPENAI_KEY_STORAGE, key);
  },
  clear() {
    localStorage.removeItem(OPENAI_KEY_STORAGE);
  },
  isSet() {
    const k = this.get();
    return k.length > 10 && k.startsWith('sk-');
  }
};

// ============================================================
// OPENAI API CALLS
// ============================================================

async function callOpenAI({ model = 'gpt-4o-mini', messages, maxTokens = 800, temperature = 0.85 }) {
  const key = LyricKeyManager.get();
  if (!key) throw new Error('Kein OpenAI API-Key gesetzt. Bitte in den Einstellungen eintragen.');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`OpenAI Fehler ${response.status}: ${err?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// ============================================================
// MODUS 1: TEMPLATE-GENERIERUNG (offline, kein API-Call)
// ============================================================

function generateTemplatelyrics(subgenreId, variant = 'standard') {
  const template = window.LYRIC_TEMPLATES?.[subgenreId];
  if (!template) return generateFallbackLyrics(subgenreId);

  const sections = template.sections[variant] || template.sections.standard;
  const sectionDefs = window.SECTION_TAGS || {};

  return sections.map(sec => {
    const tagDef = sectionDefs[sec.tag];
    const tag = tagDef ? tagDef.tag : `[${sec.tag.toUpperCase()}]`;
    return `${tag}\n${sec.lines.join('\n')}`;
  }).join('\n\n');
}

function generateFallbackLyrics(subgenreId) {
  return `[Intro]\n(atmospheric energy builds)\n\n[Build]\nThe pulse rises from the deep\n(tension building)\n\n[Drop]\nFULL ENERGY RELEASE\n(maximum psytrance impact)\n\n[Break]\n(hypnotic space)\n\n[Peak]\nPEAK INTENSITY\n(overwhelming)\n\n[Outro]\n(fade to silence)`;
}

// ============================================================
// MODUS 2: KI-GENERIERUNG via GPT-4o-mini
// ============================================================

async function generateAILyrics({ subgenreId, keywords, bpm, moods, additionalContext = '' }) {
  const template = window.LYRIC_TEMPLATES?.[subgenreId];
  if (!template) throw new Error(`Unbekanntes Subgenre: ${subgenreId}`);

  const systemPrompt = template.systemPrompt;
  const moodStr  = moods && moods.length ? `Mood: ${moods.join(', ')}.` : '';
  const kwStr    = keywords ? `Keywords / Themen: ${keywords}.` : '';
  const ctxStr   = additionalContext ? `Zusätzlicher Kontext: ${additionalContext}` : '';

  const userPrompt = `Erstelle vollständige Psytrance-Lyrics für ${template.name}.
BPM: ${bpm}
${moodStr}
${kwStr}
${ctxStr}

Wichtige Regeln:
- Nutze [Section]-Tags um Energie und Arrangement zu steuern
- Füge Energie-Direktiven in (Klammern) ein
- Die Lyrics STEUERN den Track — sie sind Arrangement-Anweisungen
- Halte es unter 400 Wörter
- Formatiere sauber mit Leerzeilen zwischen Sections`;

  return await callOpenAI({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    maxTokens: 900,
    temperature: 0.88
  });
}

// ============================================================
// MODUS 3: BILD-ANALYSE via GPT-4o Vision
// ============================================================

async function generateLyricsFromImage({ imageBase64, imageMimeType = 'image/jpeg', subgenreId, bpm, moods }) {
  const template = window.LYRIC_TEMPLATES?.[subgenreId];
  if (!template) throw new Error(`Unbekanntes Subgenre: ${subgenreId}`);

  const systemPrompt = `${template.systemPrompt}
  
Du analysierst ZUERST das Bild und extrahierst: Stimmung, Farben, Energie, Symbole, Atmosphäre.
Dann schreibst du Psytrance-Lyrics die von dieser Bildstimmung inspiriert sind.
Die Lyrics nutzen [Section]-Tags als Track-Steuerung.`;

  const moodStr = moods && moods.length ? `Vorgegebene Moods: ${moods.join(', ')}.` : '';

  const messages = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: {
            url: `data:${imageMimeType};base64,${imageBase64}`,
            detail: 'low'
          }
        },
        {
          type: 'text',
          text: `Analysiere dieses Bild und schreibe Psytrance-Lyrics für ${template.name} (${bpm} BPM).
${moodStr}
Extrahiere die Stimmung, Energie und Symbolik aus dem Bild.
Schreibe dann vollständige Lyrics mit [Section]-Tags und Energie-Direktiven in (Klammern).
Die Lyrics sollen die Bildatmosphäre spiegeln und den Track musikalisch steuern.`
        }
      ]
    }
  ];

  return await callOpenAI({
    model: 'gpt-4o',
    messages,
    maxTokens: 900,
    temperature: 0.88
  });
}

// ============================================================
// IMAGE UTILITY: File → Base64
// ============================================================

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Nur Bild-Dateien erlaubt (JPG, PNG, WebP, GIF)'));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('Bild zu groß (max. 10 MB)'));
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target.result;
      const base64  = dataUrl.split(',')[1];
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
    reader.readAsDataURL(file);
  });
}

// ============================================================
// EXTENDED PROMPT BUILDER
// ============================================================

/**
 * Baut den Extended Prompt aus:
 * - Lyrik-Direktiven (steuern Energie/Stimmung)
 * - Style-Ergänzungen (was nicht im 200-char Style-Tag Platz hat)
 * - Arrangement-Hinweise
 *
 * PRINZIP: Wenn die Lyrik die Energie steuert (via Section-Tags),
 * hat der Style-Prompt mehr Platz für Klang-Details.
 * Der Extended Prompt füllt die Lücke zwischen beiden.
 */
function buildExtendedPrompt({ subgenreId, bpm, moods, sonicElements, psychoTags, engine4dTags, customNotes }) {
  const template = window.LYRIC_TEMPLATES?.[subgenreId];
  const ep = window.EXTENDED_PROMPT_ELEMENTS || {};

  const parts = [];

  // Subgenre + BPM
  if (template) parts.push(`${template.name}, ${bpm} BPM`);

  // Mood-spezifische Arrangement-Direktive
  if (moods && moods.length) {
    parts.push(`mood: ${moods.join(', ')}`);
  }

  // Sonic-Details die nicht in 200-char passen
  if (sonicElements && sonicElements.length > 2) {
    const extra = sonicElements.slice(2);
    parts.push(`additional elements: ${extra.join(', ')}`);
  }

  // Psycho-Tags (falls vorhanden)
  if (psychoTags) parts.push(psychoTags);

  // 4D-Tags (falls vorhanden)
  if (engine4dTags) parts.push(engine4dTags);

  // Custom Notes
  if (customNotes) parts.push(customNotes);

  // Arrangement-Hinweis
  const arrHint = (ep.arrangement || [])[0] || 'arrangement: intro-build-drop-breakdown-peak-outro';
  parts.push(arrHint);

  return parts.filter(Boolean).join('. ');
}

// ============================================================
// LYRIK SECTION-TAG PARSER & EDITOR HELPER
// ============================================================

function parseLyricSections(text) {
  const sections = [];
  const lines = text.split('\n');
  let currentSection = null;
  let currentLines = [];

  lines.forEach(line => {
    const tagMatch = line.match(/^\[([^\]]+)\]/);
    if (tagMatch) {
      if (currentSection !== null) {
        sections.push({ tag: currentSection, lines: currentLines });
      }
      currentSection = tagMatch[1];
      currentLines = [];
      const rest = line.slice(tagMatch[0].length).trim();
      if (rest) currentLines.push(rest);
    } else if (currentSection !== null) {
      if (line.trim()) currentLines.push(line.trim());
    }
  });

  if (currentSection !== null) {
    sections.push({ tag: currentSection, lines: currentLines });
  }

  return sections;
}

function getSectionEnergy(tag) {
  const tagDef = window.SECTION_TAGS?.[tag.toLowerCase()];
  return tagDef?.energy || 'medium';
}

// ============================================================
// UI INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initLyricPanel();
});

function initLyricPanel() {
  // Mode switcher
  document.querySelectorAll('[data-lyric-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.lyricMode;
      switchLyricMode(mode);
    });
  });

  // API Key input
  const keyInput = document.getElementById('openai-key-input');
  const keySave  = document.getElementById('btn-save-openai-key');
  const keyClear = document.getElementById('btn-clear-openai-key');

  if (keyInput && LyricKeyManager.isSet()) {
    keyInput.value = '••••••••••••••••••••' + LyricKeyManager.get().slice(-4);
    updateKeyStatus(true);
  }

  keySave?.addEventListener('click', () => {
    const val = keyInput?.value?.trim();
    if (!val || val.startsWith('•')) { showLyricToast('Bitte echten Key eingeben'); return; }
    try {
      LyricKeyManager.set(val);
      updateKeyStatus(true);
      if (keyInput) keyInput.value = '••••••••••••••••••••' + val.slice(-4);
      showLyricToast('API-Key gespeichert ✓');
    } catch(e) { showLyricToast(e.message); }
  });

  keyClear?.addEventListener('click', () => {
    LyricKeyManager.clear();
    if (keyInput) keyInput.value = '';
    updateKeyStatus(false);
    showLyricToast('API-Key gelöscht');
  });

  // Template generation
  document.getElementById('btn-gen-template')?.addEventListener('click', () => {
    const subgenre = window.APP_STATE?.subgenre || 'dark';
    const lyrics = generateTemplatelyrics(subgenre);
    setLyricOutput(lyrics);
    showLyricToast('Template-Lyrics generiert');
  });

  // AI generation
  document.getElementById('btn-gen-ai')?.addEventListener('click', async () => {
    if (!LyricKeyManager.isSet()) {
      showLyricToast('Kein API-Key — bitte in Settings eintragen');
      document.getElementById('lyric-settings-panel')?.classList.remove('hidden');
      return;
    }
    const keywords = document.getElementById('lyric-keywords')?.value?.trim() || '';
    const subgenre = window.APP_STATE?.subgenre || 'dark';
    const bpm      = window.APP_STATE?.bpm || 148;
    const moods    = window.APP_STATE?.moods ? [...window.APP_STATE.moods] : [];
    const context  = document.getElementById('lyric-context')?.value?.trim() || '';

    setLyricLoading(true, 'KI generiert Lyrics…');
    try {
      const lyrics = await generateAILyrics({ subgenreId: subgenre, keywords, bpm, moods, additionalContext: context });
      setLyricOutput(lyrics);
      showLyricToast('KI-Lyrics generiert ✓');
    } catch(e) {
      showLyricToast(`Fehler: ${e.message}`);
    } finally {
      setLyricLoading(false);
    }
  });

  // Image upload
  document.getElementById('lyric-image-input')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!LyricKeyManager.isSet()) {
      showLyricToast('Kein API-Key — bitte in Settings eintragen');
      return;
    }

    // Preview image
    const preview = document.getElementById('lyric-image-preview');
    if (preview) {
      const url = URL.createObjectURL(file);
      preview.style.backgroundImage = `url(${url})`;
      preview.classList.add('has-image');
    }

    setLyricLoading(true, 'Analysiere Bild…');
    try {
      const { base64, mimeType } = await fileToBase64(file);
      const subgenre = window.APP_STATE?.subgenre || 'dark';
      const bpm      = window.APP_STATE?.bpm || 148;
      const moods    = window.APP_STATE?.moods ? [...window.APP_STATE.moods] : [];
      const lyrics   = await generateLyricsFromImage({ imageBase64: base64, imageMimeType: mimeType, subgenreId: subgenre, bpm, moods });
      setLyricOutput(lyrics);
      showLyricToast('Bild-Lyrics generiert ✓');
    } catch(e) {
      showLyricToast(`Fehler: ${e.message}`);
    } finally {
      setLyricLoading(false);
    }
  });

  // Drag & Drop for image
  const dropZone = document.getElementById('lyric-drop-zone');
  if (dropZone) {
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) {
        const input = document.getElementById('lyric-image-input');
        const dt = new DataTransfer();
        dt.items.add(file);
        if (input) {
          input.files = dt.files;
          input.dispatchEvent(new Event('change'));
        }
      }
    });
  }

  // Section tag insert buttons
  document.querySelectorAll('[data-insert-tag]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.insertTag;
      insertTagIntoEditor(tag);
    });
  });

  // Copy lyrics
  document.getElementById('btn-copy-lyrics')?.addEventListener('click', () => {
    const ta = document.getElementById('lyric-editor');
    if (!ta) return;
    navigator.clipboard.writeText(ta.value).then(() => showLyricToast('Lyrics kopiert!'));
  });

  // Build extended prompt
  document.getElementById('btn-build-extended')?.addEventListener('click', buildExtendedPromptUI);

  // Copy extended prompt
  document.getElementById('btn-copy-extended')?.addEventListener('click', () => {
    const el = document.getElementById('extended-prompt-output');
    if (!el) return;
    navigator.clipboard.writeText(el.textContent).then(() => showLyricToast('Extended Prompt kopiert!'));
  });

  // Section tag insert buttons
  document.querySelectorAll('[data-insert-tag]').forEach(btn => {
    btn.addEventListener('click', () => insertTagIntoEditor(btn.dataset.insertTag));
  });
}

// ============================================================
// UI HELPERS
// ============================================================

function switchLyricMode(mode) {
  document.querySelectorAll('[data-lyric-mode]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lyricMode === mode);
  });
  ['manual', 'ai', 'image'].forEach(m => {
    const panel = document.getElementById(`lyric-mode-${m}`);
    if (panel) panel.classList.toggle('hidden', m !== mode);
  });
}

function setLyricOutput(text) {
  const ta = document.getElementById('lyric-editor');
  if (ta) {
    ta.value = text;
    ta.dispatchEvent(new Event('input'));
  }
  updateSectionPreview(text);
}

function updateSectionPreview(text) {
  const preview = document.getElementById('section-energy-preview');
  if (!preview) return;
  const sections = parseLyricSections(text);
  preview.innerHTML = sections.map(s => {
    const energy = getSectionEnergy(s.tag);
    const colorMap = { low: '#00ff9d', medium: '#ffe000', high: '#ff7a00', extreme: '#ff2d78' };
    const color = colorMap[energy] || '#7878aa';
    return `<span class="section-chip" style="border-color:${color};color:${color}">[${s.tag}] <span style="font-size:0.55rem;opacity:0.7">${energy}</span></span>`;
  }).join('');
}

function setLyricLoading(active, msg = 'Lädt…') {
  const spinner = document.getElementById('lyric-spinner');
  const spinnerMsg = document.getElementById('lyric-spinner-msg');
  if (spinner) spinner.classList.toggle('hidden', !active);
  if (spinnerMsg) spinnerMsg.textContent = msg;

  // Disable buttons during load
  ['btn-gen-ai', 'btn-gen-template'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = active;
  });
}

function updateKeyStatus(hasKey) {
  const status = document.getElementById('api-key-status');
  if (!status) return;
  status.textContent   = hasKey ? '✓ API-Key gesetzt' : '✗ Kein API-Key';
  status.className     = hasKey ? 'key-status key-ok' : 'key-status key-missing';
}

function insertTagIntoEditor(tag) {
  const ta = document.getElementById('lyric-editor');
  if (!ta) return;
  const tagStr    = `\n[${tag}]\n`;
  const pos       = ta.selectionStart;
  const before    = ta.value.slice(0, pos);
  const after     = ta.value.slice(ta.selectionEnd);
  ta.value        = before + tagStr + after;
  ta.selectionStart = ta.selectionEnd = pos + tagStr.length;
  ta.focus();
  updateSectionPreview(ta.value);
}

function buildExtendedPromptUI() {
  const subgenre     = window.APP_STATE?.subgenre || 'dark';
  const bpm          = window.APP_STATE?.bpm || 148;
  const moods        = window.APP_STATE?.moods ? [...window.APP_STATE.moods] : [];
  const sonic        = window.APP_STATE?.sonic ? [...window.APP_STATE.sonic] : [];
  const psychoTags   = window.PSYCHO_TAGS || '';
  const engine4dTags = window.ENGINE_4D_TAGS || '';
  const customNotes  = document.getElementById('extended-custom-notes')?.value?.trim() || '';

  // Map sonic IDs to tag strings
  const sonicTags = (window.APP_SONIC || [])
    .filter(s => sonic.includes(s.id))
    .map(s => s.tag);

  const result = buildExtendedPrompt({
    subgenreId: subgenre,
    bpm, moods,
    sonicElements: sonicTags,
    psychoTags, engine4dTags, customNotes
  });

  const el = document.getElementById('extended-prompt-output');
  if (el) el.textContent = result;
  const counter = document.getElementById('extended-char-count');
  if (counter) {
    counter.textContent = `${result.length} chars`;
    counter.className   = 'char-counter ' + (result.length > 600 ? 'char-warn' : 'char-ok');
  }
}

function showLyricToast(msg) {
  if (window.APP_showToast) { window.APP_showToast(msg); return; }
  let toast = document.getElementById('lyric-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id        = 'lyric-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

// Expose for matrix.js
window.LyricEngine = {
  generateTemplate: generateTemplatelyrics,
  generateAI:       generateAILyrics,
  generateFromImage:generateLyricsFromImage,
  buildExtended:    buildExtendedPrompt,
  parseSections:    parseLyricSections,
  KeyManager:       LyricKeyManager
};

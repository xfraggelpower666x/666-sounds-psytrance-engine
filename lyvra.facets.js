'use strict';

(() => {
  const calc = window.LYVRA_FACETS_CALC;
  if (!calc) return;

  const STORAGE_KEY = 'lyvra-psy-engine-evidence-v1';
  const byId = id => document.getElementById(id);
  const all = selector => [...document.querySelectorAll(selector)];

  function inputValue(element) {
    if (element.type === 'checkbox') return element.checked;
    if (element.type === 'number' || element.type === 'range') return element.value === '' ? '' : Number(element.value);
    return element.value;
  }

  function readValue(selector) {
    const element = document.querySelector(selector);
    if (!element) return '';
    return element.type === 'checkbox' ? element.checked : element.value;
  }

  function showToast(message) {
    if (window.APP_showToast) window.APP_showToast(message);
  }

  function trackInput() {
    const fields = Object.fromEntries(all('[data-track-field]').map(element => [element.dataset.trackField, inputValue(element)]));
    const styleField = document.querySelector('[data-renderer-field="style"]');
    const corePrompt = window.APP_buildPrompt ? window.APP_buildPrompt(false) : '';
    const coreState = window.APP_STATE || {};
    const subgenre = window.APP_SUBGENRES?.[coreState.subgenre];
    return {
      ...fields,
      bpm: coreState.bpm,
      scale: coreState.scale,
      genreDNA: fields.genreDNA || `${subgenre?.label || 'Psytrance'} psytrance`,
      corePrompt: styleField?.dataset.userEdited === 'true' ? styleField.value : corePrompt
    };
  }

  function rendererInput() {
    return Object.fromEntries(all('[data-renderer-field]').map(element => [element.dataset.rendererField, element.value]));
  }

  function renderTrack() {
    const model = calc.buildTrackDesignModel({ ...trackInput(), ...rendererInput() });
    all('[data-renderer-field]').forEach(element => {
      const field = element.dataset.rendererField;
      if (element.dataset.userEdited !== 'true' || !element.value.trim()) element.value = model.fields[field];
      const count = byId(`track-count-${field}`);
      if (count) count.textContent = `${element.value.length}/${model.fieldLimits[field]}`;
    });
    const finalModel = calc.buildTrackDesignModel({ ...trackInput(), ...rendererInput() });
    byId('track-design-output').textContent = finalModel.creatorBrief;
  }

  function studioInput() {
    const generation = Object.fromEntries(all('[data-studio-generation]').map(element => [element.dataset.studioGeneration, inputValue(element)]));
    const operation = Object.fromEntries(all('[data-studio-operation]').map(element => [element.dataset.studioOperation, inputValue(element)]));
    const stems = all('[data-studio-stem]:checked').map(element => element.value);
    return { ...generation, ...operation, stems };
  }

  function renderStudio() {
    const plan = calc.buildStudio2Plan(studioInput());
    const list = byId('studio-timeline');
    list.replaceChildren();
    plan.sections.forEach(section => {
      const item = document.createElement('li');
      const heading = document.createElement('strong');
      heading.textContent = `${section.from}–${section.to} · ${section.name}`;
      const copy = document.createElement('p');
      copy.textContent = `${section.role} Motor: ${section.motor} LOW: ${section.lowLayer} MID: ${section.midLayer} HIGH: ${section.highLayer} Preserve: ${section.preserve} Mutate: ${section.mutate}`;
      item.append(heading, copy);
      list.append(item);
    });
    byId('studio-plan-output').textContent = [
      'Generation controls (A) remain separate from Studio operations (B).',
      `Intent: ${plan.generationControls.intent}`,
      `Renderer: ${plan.generationControls.rendererModel} | Major option: ${plan.generationControls.majorOption} | Max: ${plan.generationControls.maxMode} | Weirdness: ${plan.generationControls.weirdness ?? 'unset'} | Variety: ${plan.generationControls.variety ?? 'unset'} | Influence: ${plan.generationControls.influence ?? 'unset'} | Voice: ${plan.generationControls.voice} | Instrumental: ${plan.generationControls.instrumental} | Audio Influence: ${plan.generationControls.audioInfluence ?? 'unset'} | Conditioning: ${plan.generationControls.audioConditioning} | Seed: ${plan.generationControls.seedDuration}`,
      `Task: ${plan.operationControls.task} | Surface: ${plan.operationControls.surface} | Edit scope: ${plan.operationControls.editScope}`,
      `Operation-specific controls: ${plan.operationControls.controls}`,
      `Preserve: ${plan.sections[0].preserve}`,
      `Mutate: ${plan.sections[0].mutate}`,
      `Transition: ${plan.sections[0].transition}`,
      `Stems: ${plan.sections[0].stems.join(', ')}`,
      `Specialist operation: ${plan.operationControls.specialistOperation}`,
      `FX: ${plan.sections[0].fx}`,
      `Manual execution/observation: ${plan.operationControls.observation}`,
      `Evidence status: ${plan.operationControls.evidenceStatus}. UI preparation is not an audio/render PASS.`,
      '',
      '10-minute workflow:',
      ...plan.workflow.map((step, index) => `${index + 1}. ${step}`),
      '',
      'Timeline:',
      ...plan.sections.map(section => `${section.from}-${section.to} ${section.name}: ${section.role} Motor: ${section.motor} LOW: ${section.lowLayer} MID: ${section.midLayer} HIGH: ${section.highLayer} Preserve: ${section.preserve} Mutate: ${section.mutate} Transition: ${section.transition} Stems: ${section.stems.join(', ')} FX: ${section.fx}`)
    ].join('\n');
  }

  function speechInput() {
    const fields = Object.fromEntries(all('[data-speech-field]').map(element => [element.dataset.speechField, inputValue(element)]));
    fields.mode = document.querySelector('[data-speech-mode].active')?.dataset.speechMode || 'simple';
    return fields;
  }

  function renderSpeech() {
    const speech = calc.buildSpeechDesign(speechInput());
    byId('speech-design-output').textContent = calc.buildSpeechDesignBrief(speechInput());
    byId('speech-review-status').textContent = speech.phonemeCandidateStatus || 'Keine Phonemprüfung ausgeführt; Speech bleibt ein Entwicklungskandidat.';
  }

  function renderAll() {
    renderTrack();
    renderStudio();
    renderSpeech();
  }

  function selectFacet(name) {
    all('[data-facet-view]').forEach(button => {
      const active = button.dataset.facetView === name;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    all('[data-facet-panel]').forEach(panel => {
      const active = panel.dataset.facetPanel === name;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
    });
  }

  function setSpeechMode(mode) {
    all('[data-speech-mode]').forEach(button => {
      const active = button.dataset.speechMode === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    all('.speech-simple').forEach(element => { element.hidden = mode !== 'simple'; });
    all('.speech-advanced').forEach(element => { element.hidden = mode !== 'advanced'; });
    renderSpeech();
  }

  function readEvidence() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function saveEvidence(records) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  function renderEvidence() {
    const container = byId('evidence-log');
    const records = readEvidence();
    container.replaceChildren();
    if (!records.length) {
      const empty = document.createElement('p');
      empty.className = 'facet-note';
      empty.textContent = 'Noch keine manuell geprüften Quellen gespeichert.';
      container.append(empty);
      return;
    }
    records.forEach(record => {
      const article = document.createElement('article');
      article.className = 'facet-evidence-entry';
      const heading = document.createElement('h3');
      heading.textContent = `${record.facet} · ${record.phase} · ${record.status}`;
      const detail = document.createElement('p');
      detail.textContent = `${record.sourceClass} · Quelle: ${record.url || 'nicht angegeben'} · Quell-Datum: ${record.sourceDate || 'unbekannt'} · geprüft: ${record.checkedAt}`;
      const claim = document.createElement('p');
      claim.textContent = `Claim: ${record.claim || '—'} | Beobachtung: ${record.observation || '—'}`;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'btn btn-secondary btn-sm';
      remove.textContent = 'Eintrag löschen';
      remove.addEventListener('click', () => {
        saveEvidence(readEvidence().filter(item => item.id !== record.id));
        renderEvidence();
      });
      article.append(heading, detail, claim, remove);
      container.append(article);
    });
  }

  function evidenceInput() {
    return calc.buildEvidenceRecord({
      facet: readValue('#evidence-facet'),
      phase: readValue('#evidence-phase'),
      question: readValue('#evidence-question'),
      model: readValue('#evidence-model'),
      sourceClass: readValue('#evidence-source-class'),
      studioVersionOrMode: readValue('#evidence-studio-mode'),
      url: readValue('#evidence-url'),
      sourceDate: readValue('#evidence-source-date'),
      claim: readValue('#evidence-claim'),
      observation: readValue('#evidence-observation'),
      interpretation: readValue('#evidence-interpretation'),
      contradictions: readValue('#evidence-contradictions'),
      confidence: readValue('#evidence-confidence'),
      generalizationLimit: readValue('#evidence-generalization'),
      testCandidate: readValue('#evidence-test-candidate'),
      status: readValue('#evidence-status')
    });
  }

  function downloadFile(name, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 600);
  }

  function evidenceMarkdown(records) {
    const escape = value => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', '<br>');
    const header = '| Facet | Phase | Question | Model | Studio version/mode | Source class | URL | Source date | Checked at | Claim | Observation | Interpretation | Contradictions | Confidence | Generalization limit | Test candidate | Status |';
    const separator = `|${' --- |'.repeat(17)}`;
    const rows = records.map(record => `| ${[
      record.facet, record.phase, record.question, record.model, record.studioVersionOrMode, record.sourceClass,
      record.url, record.sourceDate, record.checkedAt, record.claim, record.observation,
      record.interpretation, record.contradictions, record.confidence,
      record.generalizationLimit, record.testCandidate, record.status
    ].map(escape).join(' | ')} |`);
    return ['# LYVRA PSY ENGINE · Evidence Log', '', 'Manually reviewed entries; search readback is not automatic.', '', header, separator, ...rows].join('\n');
  }

  function getProjectData() {
    const core = window.APP_STATE || {};
    const track = calc.buildTrackDesignModel({ ...trackInput(), ...rendererInput() });
    const studio = calc.buildStudio2Plan(studioInput());
    const speech = calc.buildSpeechDesign(speechInput());
    return {
      schema: 'LYVRA_PSY_ENGINE_PROJECT_v1',
      productName: 'LYVRA PSY ENGINE',
      exportedAt: new Date().toISOString(),
      identity: {
        oneIdentityManyFacets: true,
        nativeAuthority: 'LYVRA native repository; not accessed or verified by this export',
        templateBoundary: 'Local deterministic UI; not native intelligence or an independent agent'
      },
      provenance: {
        nativeRepository: 'https://github.com/xfraggelpower666x/LYVRA-Living-Yielding-Vibration-and-Resonance-Architecture',
        productiveBranchReference: 'lyvra',
        nativeSourceSha256: readValue('#native-source-sha'),
        sourceShaStatus: readValue('#native-source-sha') ? 'user-entered; not verified by this app' : 'not supplied',
        speechDevelopmentPR: 'https://github.com/xfraggelpower666x/LYVRA-Living-Yielding-Vibration-and-Resonance-Architecture/pull/23',
        speechReleaseStatus: 'DEV candidate; not released'
      },
      coreEngine: {
        subgenre: core.subgenre || '',
        bpm: core.bpm ?? null,
        sonic: Array.isArray(core.sonic) ? [...core.sonic] : [...(core.sonic || [])],
        moods: Array.isArray(core.moods) ? [...core.moods] : [...(core.moods || [])],
        key: track.controls.key,
        scale: core.scale || '',
        mixTrait: core.mixTrait || '',
        prompt: window.APP_buildPrompt ? window.APP_buildPrompt(false) : ''
      },
      trackDesign: {
        creatorControls: track.creatorControls,
        semanticControls: track.controls,
        rendererFields: track.fields,
        observedFieldLimits: track.fieldLimits,
        creatorBrief: track.creatorBrief
      },
      studio2: studio,
      speechDesign: {
        status: 'DEV candidate; not a released production facet',
        inputsAndCandidateReview: speech
      },
      researchEvidence: readEvidence(),
      verification: {
        automaticWebReadback: false,
        sunoGeneration: false,
        audioRenderPass: false,
        actualTimecodedSpeechReviewPassed: speech.actualTimecodedWordReviewPassed,
        rendererVerified: false,
        uiTestIsAudioPass: false
      },
      exports: { format: 'json', exportedAt: new Date().toISOString() }
    };
  }

  function projectMarkdown(project) {
    const section = (title, content) => `## ${title}\n\n\`\`\`text\n${content}\n\`\`\``;
    const renderer = Object.entries(project.trackDesign.rendererFields)
      .map(([name, content]) => `${name.toUpperCase()}\n${content}`).join('\n\n');
    return [
      '# LYVRA PSY ENGINE · Lokaler Projekt-Export',
      '',
      `Exportiert: ${project.exportedAt}`,
      '',
      'Template export; native repository state, Suno rendering and audio were not verified.',
      '',
      section('Core Prompt', project.coreEngine.prompt),
      '',
      section('Track Renderer Fields', renderer),
      '',
      section('Track Creator Controls', JSON.stringify(project.trackDesign.creatorControls, null, 2)),
      '',
      section('Track Semantic Brief', project.trackDesign.creatorBrief),
      '',
      section('Studio 2 Longform Plan', JSON.stringify(project.studio2, null, 2)),
      '',
      section('Speech Design · DEV', JSON.stringify(project.speechDesign, null, 2)),
      '',
      section('Manual Research Evidence', JSON.stringify(project.researchEvidence, null, 2)),
      '',
      section('Provenance and Verification', JSON.stringify({ provenance: project.provenance, verification: project.verification }, null, 2))
    ].join('\n');
  }

  function bindEvents() {
    all('[data-facet-view]').forEach(button => button.addEventListener('click', () => selectFacet(button.dataset.facetView)));
    all('[data-track-field], [data-renderer-field]').forEach(element => {
      element.addEventListener('input', () => {
        if (element.hasAttribute('data-renderer-field')) element.dataset.userEdited = 'true';
        renderTrack();
      });
      element.addEventListener('change', renderTrack);
    });
    byId('facet-sync-core').addEventListener('click', () => {
      const style = document.querySelector('[data-renderer-field="style"]');
      style.value = window.APP_buildPrompt ? window.APP_buildPrompt(false) : '';
      style.dataset.userEdited = 'false';
      renderTrack();
      showToast('Core-Prompt übernommen.');
    });
    all('[data-studio-generation], [data-studio-operation], [data-studio-stem]').forEach(element => {
      element.addEventListener(element.type === 'range' ? 'input' : 'change', renderStudio);
      if (element.type === 'text') element.addEventListener('input', renderStudio);
    });
    all('[data-speech-field]').forEach(element => {
      element.addEventListener(element.type === 'checkbox' ? 'change' : 'input', renderSpeech);
    });
    all('[data-speech-mode]').forEach(button => button.addEventListener('click', () => setSpeechMode(button.dataset.speechMode)));
    all('[data-research-facet]').forEach(button => button.addEventListener('click', () => {
      const facet = button.dataset.researchFacet;
      const phase = button.dataset.researchPhase;
      const sourceClass = button.dataset.researchSource;
      const url = calc.createResearchSearchUrl(facet, phase, sourceClass);
      byId('evidence-facet').value = facet;
      byId('evidence-phase').value = phase;
      byId('evidence-question').value = calc.RESEARCH_QUERIES[facet][phase][sourceClass];
      byId('evidence-source-class').value = sourceClass === 'community' ? 'dated_community' : 'current_official';
      const selectedModel = facet === 'track'
        ? readValue('[data-track-field="model"]')
        : facet === 'studio2' ? readValue('[data-studio-generation="rendererModel"]') : 'Speech Beta · DEV';
      byId('evidence-model').value = selectedModel || 'Not selected';
      byId('evidence-studio-mode').value = facet === 'speech' ? readValue('[data-speech-mode].active') : '';
      window.open(url, '_blank', 'noopener,noreferrer');
    }));
    byId('evidence-save').addEventListener('click', () => {
      const record = evidenceInput();
      if (!record.url || !record.claim || !record.observation) {
        showToast('Bitte URL, Claim und Beobachtung ergänzen.');
        return;
      }
      try {
        const records = readEvidence();
        records.unshift(record);
        saveEvidence(records);
        renderEvidence();
        showToast('Evidenz lokal gespeichert.');
      } catch {
        showToast('Lokaler Speicher ist nicht verfügbar.');
      }
    });
    byId('evidence-export-json').addEventListener('click', () => {
      const records = readEvidence();
      downloadFile('lyvra-evidence.json', JSON.stringify({ schema: 'LYVRA_EVIDENCE_LOG_v1', exportedAt: new Date().toISOString(), records }, null, 2), 'application/json');
    });
    byId('evidence-export-md').addEventListener('click', () => downloadFile('lyvra-evidence.md', evidenceMarkdown(readEvidence()), 'text/markdown'));
    byId('facet-project-export-json').addEventListener('click', () => {
      downloadFile('LYVRA_PSY_ENGINE_PROJECT.json', JSON.stringify(getProjectData(), null, 2), 'application/json');
    });
    byId('facet-project-export-md').addEventListener('click', () => {
      const project = getProjectData();
      downloadFile('LYVRA_PSY_ENGINE_PROJECT.md', projectMarkdown(project), 'text/markdown');
    });
    all('[data-copy-renderer]').forEach(button => button.addEventListener('click', async () => {
      const target = document.querySelector(`[data-renderer-field="${button.dataset.copyRenderer}"]`);
      try {
        await navigator.clipboard.writeText(target.value);
        showToast(`${button.dataset.copyRenderer} kopiert.`);
      } catch {
        target.focus();
        target.select();
        showToast('Text markiert; Zwischenablage nicht verfügbar.');
      }
    }));
    document.addEventListener('app:statechange', renderTrack);
    document.addEventListener('app:tabchange', event => {
      if (event.detail?.tab === 'facets') renderAll();
    });
  }

  function init() {
    if (!byId('panel-facets')) return;
    bindEvents();
    selectFacet('track');
    setSpeechMode('simple');
    renderAll();
    renderEvidence();
  }

  document.addEventListener('DOMContentLoaded', init, { once: true });
})();

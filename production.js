'use strict';

const PRODUCTION_SAMPLES = [
  {
    id: 1,
    type: 'AUDIO',
    label: 'my_148bpm_bassline_demo.wav',
    role: 'Rhythmic movement only',
    preserve: ['bass rhythm', 'energy'],
    transform: ['timbre', 'sound design'],
    weight: 'Primary'
  },
  {
    id: 2,
    type: 'MIDI',
    label: 'phrygian_acid_seed.mid',
    role: 'Acid motif and tonal anchor',
    preserve: ['note rhythm', 'scale'],
    transform: ['synth patch', 'automation'],
    weight: 'Supporting'
  },
  {
    id: 3,
    type: 'IMAGE',
    label: 'cavern_ritual_moodboard.jpg',
    role: 'Mood and spatial reference',
    preserve: ['darkness', 'organic texture'],
    transform: ['visual content into sonic descriptors'],
    weight: 'Subtle'
  }
];

function initProductionEngine() {
  const calc = window.PRODUCTION_CALC;
  if (!calc) throw new Error('Production calculator did not load.');

  const state = {
    model: 'v6',
    maxMode: true,
    sources: PRODUCTION_SAMPLES.map(source => ({ ...source, preserve: [...source.preserve], transform: [...source.transform] })),
    nextSourceId: PRODUCTION_SAMPLES.length + 1,
    motor: {
      preset: 'darkRolling',
      ...calc.MOTOR_PRESETS.darkRolling,
      safety: { ...calc.MOTOR_SAFETY_DEFAULTS }
    },
    fxMotion: {
      ...calc.FX_MOTION_DEFAULTS,
      selectedFamilies: [...calc.FX_MOTION_DEFAULTS.selectedFamilies],
      safety: { ...calc.FX_MOTION_DEFAULTS.safety }
    },
    evidence: {
      claims: [],
      rules: [],
      conflicts: [],
      recommendations: [],
      auditTrail: [],
      confidence: 0
    },
    evidenceFeedback: {
      subMonoStable: '',
      acidWidthAudible: '',
      dropClearer: ''
    },
    audioMetrics: { stereoCorrelation: '' }
  };

  const byId = id => document.getElementById(id);
  const selectedValues = group => [...group.querySelectorAll('.active')].map(button => button.dataset.value || button.textContent.trim());

  function renderSources() {
    const container = byId('sourceContainer');
    container.replaceChildren();

    if (!state.sources.length) {
      const empty = document.createElement('p');
      empty.className = 'production-note';
      empty.textContent = 'No sources yet. The shared Core prompt still generates a complete style brief.';
      container.appendChild(empty);
      return;
    }

    state.sources.forEach((source, index) => {
      const section = document.createElement('section');
      section.className = 'production-source';
      section.setAttribute('aria-label', `${source.type} source ${index + 1}`);

      const header = document.createElement('div');
      header.className = 'production-source-header';
      const title = document.createElement('strong');
      title.textContent = `${source.type} source`;
      const remove = document.createElement('button');
      remove.className = 'production-remove';
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', `Remove source ${source.label || index + 1}`);
      remove.addEventListener('click', () => {
        state.sources = state.sources.filter(item => item.id !== source.id);
        renderSources();
        renderProduction();
      });
      header.append(title, remove);
      section.appendChild(header);

      const fields = document.createElement('div');
      fields.className = 'production-source-fields';
      [
        ['label', 'Label / file / reference', 'Describe the source; no file is uploaded'],
        ['role', 'Musical role', 'e.g. rhythmic movement only'],
        ['preserve', 'Preserve', 'Separate multiple items with commas'],
        ['transform', 'Transform', 'Separate multiple items with commas']
      ].forEach(([key, labelText, placeholder]) => {
        const label = document.createElement('label');
        label.className = 'production-field';
        label.textContent = labelText;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = Array.isArray(source[key]) ? source[key].join(', ') : source[key];
        input.placeholder = placeholder;
        input.addEventListener('input', () => {
          source[key] = key === 'preserve' || key === 'transform'
            ? input.value.split(',').map(value => value.trim()).filter(Boolean)
            : input.value;
          remove.setAttribute('aria-label', `Remove source ${source.label || index + 1}`);
          renderProduction();
        });
        label.appendChild(input);
        fields.appendChild(label);
      });

      const weightLabel = document.createElement('label');
      weightLabel.className = 'production-field';
      weightLabel.textContent = 'Weight';
      const weight = document.createElement('select');
      ['Primary', 'Supporting', 'Subtle'].forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        weight.appendChild(option);
      });
      weight.value = source.weight || 'Supporting';
      weight.addEventListener('change', () => {
        source.weight = weight.value;
        renderProduction();
      });
      weightLabel.appendChild(weight);
      fields.appendChild(weightLabel);
      section.appendChild(fields);
      container.appendChild(section);
    });
  }

  function getCoreData() {
    const appState = window.APP_STATE;
    const genre = window.APP_SUBGENRES?.[appState?.subgenre];
    const sonic = (window.APP_SONIC || []).filter(item => appState?.sonic?.has(item.id));
    const moods = (window.APP_MOODS || []).filter(item => appState?.moods?.has(item.id));
    const moodLabels = moods.map(item => item.label);
    const sonicLabels = sonic.map(item => item.label);
    const sonicTags = sonic.map(item => item.tag);
    const bpm = Number(appState?.bpm) || 148;
    const subgenre = genre?.label || 'Dark Psy';
    const scale = appState?.scale || 'Phrygian';
    const mix = appState?.mixTrait || 'huge low-end';
    const rhythm = sonicTags.find(tag => /bass|kick|percussion/i.test(tag)) || 'core psytrance groove';
    return {
      appState,
      sonicLabels,
      moodLabels,
      subgenre,
      bpm,
      scale,
      mix,
      hardAnchors: {
        genre: `${subgenre} psytrance`,
        tempo: `${bpm} BPM`,
        rhythm,
        tonalCenter: `${scale} tension`,
        mix
      }
    };
  }

  function buildCausalContext(core = getCoreData()) {
    const psycho = window.PSYCHO_STATE;
    return {
      model: state.model,
      core: {
        genre: core.subgenre,
        bpm: core.bpm,
        scale: core.scale,
        mix: core.mix,
        moods: [...core.moodLabels],
        sonicElements: [...core.sonicLabels]
      },
      motor: {
        ...state.motor,
        safety: { ...state.motor.safety }
      },
      psycho: {
        mode: psycho.haasMode,
        target: psycho.haasTarget,
        delayMs: psycho.haasDelayMs,
        stereoLowCutHz: psycho.stereoLowCutHz,
        width: psycho.stereoIntensity,
        wetDry: psycho.wetDryMix,
        motionRate: psycho.motionRate,
        safety: { ...psycho.safety }
      },
      fx: {
        ...state.fxMotion,
        selectedFamilies: [...state.fxMotion.selectedFamilies],
        safety: { ...state.fxMotion.safety }
      },
      sources: state.sources.map(source => ({ ...source }))
    };
  }

  function renderMotorTools(core = getCoreData()) {
    const motor = state.motor;
    const warnings = calc.auditMotorSettings(motor);
    const styleTag = calc.buildMotorStyleTag(motor);
    const studioBrief = calc.buildMotorStudioBrief({
      ...motor,
      bpm: core.bpm,
      subgenre: core.subgenre
    });

    byId('motorStyleOutput').textContent = styleTag;
    byId('motorStudioOutput').textContent = studioBrief;
    byId('motorGuardOutput').textContent = warnings.length
      ? warnings.map(warning => `⚠ ${warning}`).join('\n')
      : '✓ Motor stable: Kick, bass and sub architecture are conflict-free.';

    const badge = byId('motorStatus');
    const critical = !motor.safety.kickMono
      || !motor.safety.subMono
      || !motor.safety.phaseLock
      || !motor.safety.lowEndGuard
      || warnings.some(warning => /overlap/i.test(warning));
    badge.className = `motor-badge ${warnings.length ? critical ? 'danger' : 'warning' : ''}`.trim();
    badge.textContent = warnings.length
      ? critical ? 'MOTOR RISK' : 'CHECK MOTOR'
      : 'MOTOR STABLE';

    return { styleTag, studioBrief, warnings };
  }

  function renderFxMotionTools() {
    const settings = state.fxMotion;
    const warnings = calc.auditFxMotionSettings(settings);
    const styleTag = calc.buildFxMotionTag(settings);
    const plan = calc.buildFxMotionPlan(settings);
    const automation = calc.buildFxMotionBrief(settings);
    byId('fxPlanOutput').textContent = plan;
    byId('fxAutomationOutput').textContent = automation;
    byId('fxStyleOutput').textContent = styleTag;

    const badge = byId('fxMotionStatus');
    const critical = warnings.some(warning => /kick|subbass|mono|unsafe/i.test(warning));
    badge.className = `fx-badge ${warnings.length ? critical ? 'danger' : 'warning' : ''}`.trim();
    badge.textContent = warnings.length ? critical ? 'FX RISK' : 'CHECK FX' : 'FX CONTROLLED';

    return { plan, automation, styleTag, warnings };
  }

  function bindMotorTools() {
    const fields = [
      ['bassPattern', 'bassPattern'],
      ['kickStyle', 'kickStyle'],
      ['kickLength', 'kickLengthMs'],
      ['kickClick', 'kickClick'],
      ['bassLength', 'bassNoteLength'],
      ['bassDrive', 'bassDrive'],
      ['rubberMovement', 'rubberMovement'],
      ['grooveTightness', 'grooveTightness']
    ];
    const outputFormats = {
      kickLength: value => `${value} ms`,
      kickClick: value => `${value}%`,
      bassLength: value => `${value}%`,
      bassDrive: value => `${value}%`,
      rubberMovement: value => `${value}%`,
      grooveTightness: value => `${value}%`
    };

    const syncControls = () => {
      byId('motorPreset').value = state.motor.preset;
      fields.forEach(([id, key]) => {
        const input = byId(id);
        input.value = state.motor[key];
        const output = byId(`${id}Out`);
        if (output) {
          output.value = (outputFormats[id] || (value => value))(state.motor[key]);
        }
      });
      document.querySelectorAll('#motorSafety [data-motor-safety]').forEach(button => {
        const enabled = state.motor.safety[button.dataset.motorSafety] === true;
        button.classList.toggle('active', enabled);
        button.setAttribute('aria-pressed', String(enabled));
      });
    };

    const markCustom = () => {
      state.motor.preset = 'custom';
      byId('motorPreset').value = 'custom';
    };

    fields.forEach(([id, key]) => {
      const input = byId(id);
      input.addEventListener(input.type === 'range' ? 'input' : 'change', event => {
        state.motor[key] = input.type === 'range' ? Number(event.target.value) : event.target.value;
        markCustom();
        const output = byId(`${id}Out`);
        if (output) output.value = (outputFormats[id] || (value => value))(state.motor[key]);
        renderProduction();
      });
    });

    byId('motorPreset').addEventListener('change', event => {
      const preset = event.target.value;
      if (preset !== 'custom') {
        const values = calc.MOTOR_PRESETS[preset];
        if (!values) throw new Error(`Unknown motor preset: ${preset}`);
        Object.assign(state.motor, values);
      }
      state.motor.preset = preset;
      syncControls();
      renderProduction();
    });

    document.querySelectorAll('#motorSafety [data-motor-safety]').forEach(button => {
      button.addEventListener('click', () => {
        const key = button.dataset.motorSafety;
        state.motor.safety[key] = !state.motor.safety[key];
        markCustom();
        syncControls();
        renderProduction();
      });
    });

    syncControls();
  }

  function bindFXMotionSystem() {
    const fields = [
      ['fxFamilyLens', 'family'],
      ['fxSubgenreMode', 'subgenre'],
      ['fxTrackPhase', 'phase'],
      ['fxMotionMode', 'motion'],
      ['fxEnergy', 'energy'],
      ['fxTension', 'tension'],
      ['fxDensity', 'density'],
      ['fxWidth', 'width'],
      ['fxChaos', 'chaos'],
      ['fxSpace', 'space']
    ];
    const outputFormats = {
      fxEnergy: value => `${value}%`,
      fxTension: value => `${value}%`,
      fxDensity: value => `${value}%`,
      fxWidth: value => `${value}%`,
      fxChaos: value => `${value}%`,
      fxSpace: value => `${value}%`
    };

    fields.forEach(([id, key]) => {
      const input = byId(id);
      input.addEventListener(input.type === 'range' ? 'input' : 'change', event => {
        state.fxMotion[key] = input.type === 'range' ? Number(event.target.value) : event.target.value;
        const output = byId(`${id}Out`);
        if (output) output.value = (outputFormats[id] || (value => value))(state.fxMotion[key]);
        renderProduction();
      });
    });

    const syncFamilies = () => {
      const selected = new Set(state.fxMotion.selectedFamilies);
      document.querySelectorAll('#fxFamilies .toggle-btn').forEach(button => {
        const active = selected.has(button.textContent.trim());
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
        button.disabled = selected.size >= 4 && !active;
      });
    };

    document.querySelectorAll('#fxFamilies .toggle-btn').forEach(button => {
      button.addEventListener('click', () => {
        const family = button.textContent.trim();
        const selected = state.fxMotion.selectedFamilies;
        if (selected.includes(family)) {
          state.fxMotion.selectedFamilies = selected.filter(value => value !== family);
        } else if (selected.length < 4) {
          state.fxMotion.selectedFamilies = [...selected, family];
        }
        syncFamilies();
        renderProduction();
      });
    });

    document.querySelectorAll('#fxSafety [data-fx-safety]').forEach(button => {
      button.addEventListener('click', () => {
        const key = button.dataset.fxSafety;
        state.fxMotion.safety[key] = !state.fxMotion.safety[key];
        button.classList.toggle('active', state.fxMotion.safety[key]);
        button.setAttribute('aria-pressed', String(state.fxMotion.safety[key]));
        renderProduction();
      });
    });

    fields.forEach(([id, key]) => {
      const input = byId(id);
      const output = byId(`${id}Out`);
      if (output && outputFormats[id]) output.value = outputFormats[id](state.fxMotion[key]);
    });
    syncFamilies();
  }

  function renderEvidenceLab(evidence = state.evidence) {
    byId('evidenceClaimCount').textContent = String(evidence.claims.length);
    byId('evidenceConflictCount').textContent = String(evidence.conflicts.length);
    byId('evidenceConfidence').textContent = `${evidence.confidence}%`;
    byId('evidenceOutput').textContent = calc.formatProductionEvidence(evidence);

    const badge = byId('evidenceStatus');
    if (evidence.risk === 'high') {
      badge.className = 'evidence-badge danger';
      badge.textContent = 'CONFLICT DETECTED';
    } else if (evidence.conflicts.length) {
      badge.className = 'evidence-badge warning';
      badge.textContent = 'REVIEW REQUIRED';
    } else if (!evidence.claims.length) {
      badge.className = 'evidence-badge warning';
      badge.textContent = 'NO RULE MATCH';
    } else {
      badge.className = 'evidence-badge';
      badge.textContent = 'EVIDENCE READY';
    }
  }

  function bindEvidenceLab() {
    const ratingFields = [
      ['reviewSubMono', 'subMonoStable'],
      ['reviewAcidWidth', 'acidWidthAudible'],
      ['reviewDropClearer', 'dropClearer']
    ];
    ratingFields.forEach(([id, key]) => {
      byId(id).addEventListener('change', event => {
        state.evidenceFeedback[key] = event.target.value;
        renderProduction();
      });
    });
    byId('stereoCorrelation').addEventListener('input', event => {
      state.audioMetrics.stereoCorrelation = event.target.value;
      renderProduction();
    });
    byId('resetEvidenceReview').addEventListener('click', () => {
      ratingFields.forEach(([id, key]) => {
        state.evidenceFeedback[key] = '';
        byId(id).value = '';
      });
      state.audioMetrics.stereoCorrelation = '';
      byId('stereoCorrelation').value = '';
      renderProduction();
    });
    byId('copyEvidence').addEventListener('click', () => {
      copyText(calc.formatProductionEvidence(state.evidence), 'Evidence report copied.');
    });
    byId('copyEvidenceJSON').addEventListener('click', () => {
      copyText(JSON.stringify({
        generatedAt: new Date().toISOString(),
        context: state.evidence.context,
        ...state.evidence
      }, null, 2), 'Evidence JSON copied.');
    });
  }

  function renderProduction() {
    const core = getCoreData();
    const motor = renderMotorTools(core);
    const fxMotion = renderFxMotionTools();
    const causalContext = buildCausalContext(core);
    const causalClaims = calc.evaluateCausalRules(causalContext);
    const corePrompt = window.APP_buildPrompt ? window.APP_buildPrompt(false) : '';
    const settings = {
      weirdness: Number(byId('weirdness').value),
      influence: Number(byId('influence').value),
      diversity: Number(byId('diversity').value),
      hardAnchors: core.hardAnchors
    };
    const psycho = window.PSYCHO_STATE;
    const psychoTag = calc.buildPsychoStyleTag({
      mode: psycho.haasMode,
      target: psycho.haasTarget,
      delayMs: psycho.haasDelayMs,
      lowCutHz: psycho.stereoLowCutHz,
      intensity: psycho.stereoIntensity,
      motion: psycho.motionRate
    });
    const prompt = calc.buildStylePrompt({
      corePrompt,
      model: state.model,
      settings,
      psychoStyleTag: psychoTag,
      motorStyleTag: motor.styleTag,
      fxMotionTag: fxMotion.styleTag,
      evidenceClaims: causalClaims
        .filter(claim => claim.confidence >= 0.8)
        .map(claim => claim.effect),
      duration: byId('duration').value,
      customStyle: byId('customStyle').value,
      maxMode: state.maxMode,
      negativeStyle: byId('negative').value,
      limit: window.JUNO_LIMITS?.style || 1000
    });
    const studioTargets = selectedValues(byId('studioTargets'));
    const effects = selectedValues(byId('fxPresets'));

    byId('production-core-summary').textContent =
      `${core.subgenre} · ${core.bpm} BPM · ${core.scale} · ${core.mix}`;
    byId('production-core-prompt').textContent = corePrompt || 'Core prompt is not available yet.';
    byId('styleOutput').textContent = prompt.text;
    byId('sourceOutput').textContent = calc.buildSourceRequest(state.sources, byId('sourceIntent').value);
    const studioBrief = calc.buildStudioBrief({
      targets: studioTargets,
      effects,
      bpm: core.bpm,
      subgenre: core.subgenre,
      mix: core.mix
    });
    const psychoBrief = calc.buildPsychoStudioBrief({
      mode: psycho.haasMode,
      target: psycho.haasTarget,
      delayMs: psycho.haasDelayMs,
      lowCutHz: psycho.stereoLowCutHz,
      intensity: psycho.stereoIntensity,
      motion: psycho.motionRate,
      offsetMs: psycho.leftRightOffsetMs,
      stereoSide: psycho.stereoSide,
      motionDepth: psycho.motionDepth,
      correlationThreshold: psycho.correlationThreshold,
      autoWidthReductionAmount: psycho.autoWidthReductionAmount,
      kickBypassSensitivity: psycho.kickBypassSensitivity,
      wetDryMix: psycho.wetDryMix,
      outputTrimDb: psycho.outputTrimDb,
      outputLimiter: psycho.outputLimiter,
      safety: psycho.safety
    });
    const pluginBrief = calc.buildHaasBrief(psycho);
    byId('studioOutput').textContent =
      `${studioBrief}\n\n${psychoBrief}\n\n${motor.studioBrief}\n\n${fxMotion.plan}\n\n${fxMotion.automation}`;
    byId('fxOutput').textContent = calc.buildEffectBrief(effects, psycho);
    byId('psychoStyleOutput').textContent = psychoTag;
    byId('haasAutomationOutput').textContent = psychoBrief;
    byId('haasPluginOutput').textContent = pluginBrief;

    const counter = byId('productionCharCount');
    counter.textContent = `${prompt.text.length}/${prompt.limit}`;
    counter.className = `char-counter ${prompt.truncated ? 'char-warn' : 'char-ok'}`;

    const allWarnings = calc.findProductionConflicts({
      model: state.model,
      weirdness: settings.weirdness,
      moods: core.moodLabels,
      sonic: core.sonicTags,
      bpm: core.bpm,
      subgenre: core.subgenre,
      mix: core.mix
    });
    if (core.appState?.guardWarnings?.length) allWarnings.unshift(...core.appState.guardWarnings);
    allWarnings.push(...calc.auditPsychoSettings(psycho));
    allWarnings.push(...motor.warnings.map(warning => `Motor: ${warning}`));
    allWarnings.push(...fxMotion.warnings.map(warning => `FX Motion: ${warning}`));
    allWarnings.push(...causalClaims
      .filter(claim => claim.risk === 'high')
      .map(claim => `${claim.subject}: ${claim.effect}`));
    allWarnings.push(...calc.findSemanticConflicts(causalContext));
    if (prompt.truncated) allWarnings.push('Style prompt reached its character limit; some optional directions were omitted.');
    const finalWarnings = [...new Set(allWarnings)];

    state.evidence = calc.buildProductionEvidenceState({
      context: causalContext,
      warnings: finalWarnings,
      feedback: state.evidenceFeedback,
      audioMetrics: state.audioMetrics,
      stylePrompt: prompt.text,
      studioBrief: byId('studioOutput').textContent
    });
    renderEvidenceLab(state.evidence);

    const guard = byId('productionGuard');
    guard.className = `production-guard guard-bar ${finalWarnings.length ? 'guard-warn' : 'guard-ok'}`;
    guard.textContent = finalWarnings.length
      ? `⚠ ${finalWarnings.join(' ')}`
      : '✓ Production brief is ready; shared Core anchors are preserved.';

    const status = byId('psychoStatus');
    const protectedTarget = ['kick', 'subbass', 'sub bass'].includes(String(psycho.haasTarget).toLowerCase());
    status.className = 'psycho-badge';
    if (protectedTarget) {
      status.classList.add('warning');
      status.textContent = 'PROTECTED: KEEP MONO';
    } else if (psycho.haasMode === 'off') {
      status.textContent = 'MONO SAFE';
    } else if (!psycho.safety.subMono || !psycho.safety.sideLowCut || psycho.stereoLowCutHz < 120) {
      status.classList.add('danger');
      status.textContent = 'MONO SAFETY OFF';
    } else if (!psycho.safety.correlationMonitor
      || !psycho.safety.kickTransientBypass
      || !psycho.safety.autoWidthReduction) {
      status.classList.add('warning');
      status.textContent = 'CHECK SAFETY';
    } else {
      status.textContent = 'MONO SAFE';
    }

    ['weirdness', 'influence', 'diversity'].forEach(id => {
      byId(`${id}Out`).value = `${byId(id).value}%`;
    });
  }

  document.querySelectorAll('#modelButtons [data-model]').forEach(button => {
    button.addEventListener('click', () => {
      state.model = button.dataset.model;
      document.querySelectorAll('#modelButtons [data-model]').forEach(option => {
        const selected = option === button;
        option.classList.toggle('active', selected);
        option.setAttribute('aria-pressed', String(selected));
      });
      renderProduction();
    });
  });

  ['studioTargets', 'fxPresets'].forEach(id => {
    const group = byId(id);
    const max = 2;
    group.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button || !group.contains(button)) return;
      const activeButtons = group.querySelectorAll('.active');
      if (id === 'studioTargets' && button.textContent.trim() === 'Full generation') {
        group.querySelectorAll('button').forEach(option => {
          const selected = option === button && !button.classList.contains('active');
          option.classList.toggle('active', selected);
          option.setAttribute('aria-pressed', String(selected));
        });
        renderProduction();
        return;
      }
      if (id === 'studioTargets') {
        const fullGeneration = [...group.querySelectorAll('button')]
          .find(option => option.textContent.trim() === 'Full generation');
        fullGeneration?.classList.remove('active');
        fullGeneration?.setAttribute('aria-pressed', 'false');
      }
      if (!button.classList.contains('active') && activeButtons.length >= max) {
        window.APP_showToast?.(`Maximum ${max} selections allowed.`);
        return;
      }
      const selected = button.classList.toggle('active');
      button.setAttribute('aria-pressed', String(selected));
      renderProduction();
    });
    group.querySelectorAll('button').forEach(button => {
      button.setAttribute('aria-pressed', String(button.classList.contains('active')));
    });
  });

  ['duration', 'customStyle', 'sourceIntent', 'negative'].forEach(id => {
    byId(id).addEventListener('input', renderProduction);
    byId(id).addEventListener('change', renderProduction);
  });
  ['weirdness', 'influence', 'diversity'].forEach(id => byId(id).addEventListener('input', renderProduction));
  byId('maxMode').addEventListener('click', event => {
    state.maxMode = !state.maxMode;
    event.currentTarget.textContent = `MAX MODE: ${state.maxMode ? 'ON' : 'OFF'}`;
    event.currentTarget.setAttribute('aria-pressed', String(state.maxMode));
    renderProduction();
  });
  byId('addSource').addEventListener('click', () => {
    state.sources.push({
      id: state.nextSourceId++,
      type: byId('sourceType').value,
      label: '',
      role: '',
      preserve: [],
      transform: [],
      weight: 'Supporting'
    });
    renderSources();
    renderProduction();
  });

  async function copyText(text, successMessage) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const temporary = document.createElement('textarea');
        temporary.value = text;
        temporary.setAttribute('readonly', '');
        temporary.style.position = 'fixed';
        temporary.style.opacity = '0';
        document.body.appendChild(temporary);
        temporary.select();
        const copied = document.execCommand('copy');
        temporary.remove();
        if (!copied) throw new Error('Clipboard access is unavailable.');
      }
      window.APP_showToast?.(successMessage);
    } catch (error) {
      window.APP_showToast?.(`Copy failed: ${error.message}`);
    }
  }

  byId('generate').addEventListener('click', () => {
    renderProduction();
    window.APP_showToast?.('Production briefs updated.');
  });
  byId('copyV6').addEventListener('click', () => copyText(
    `${byId('styleOutput').textContent}\n\n${byId('sourceOutput').textContent}`,
    'Style and source brief copied.'
  ));
  byId('copyStudio').addEventListener('click', () => copyText(
    `${byId('studioOutput').textContent}\n\n${byId('fxOutput').textContent}`,
    'Studio and FX briefs copied.'
  ));
  byId('snapshot').addEventListener('click', () => {
    const core = getCoreData();
    const snapshot = {
      createdAt: new Date().toISOString(),
      model: state.model,
      customStyle: byId('customStyle').value,
      core: {
        genre: core.subgenre,
        bpm: String(core.bpm),
        scale: core.scale,
        mix: core.mix,
        sonicElements: core.sonicTags,
        mood: core.moodLabels
      },
      controls: {
        duration: byId('duration').value,
        weirdness: byId('weirdness').value,
        influence: byId('influence').value,
        diversity: byId('diversity').value,
        max: state.maxMode
      },
      psychoacoustic: {
        preset: byId('haasPreset').value,
        haasMode: window.PSYCHO_STATE.haasMode,
        haasTarget: window.PSYCHO_STATE.haasTarget,
        haasDelayMs: window.PSYCHO_STATE.haasDelayMs,
        stereoLowCutHz: window.PSYCHO_STATE.stereoLowCutHz,
        stereoIntensity: window.PSYCHO_STATE.stereoIntensity,
        leftRightOffsetMs: window.PSYCHO_STATE.leftRightOffsetMs,
        stereoSide: window.PSYCHO_STATE.stereoSide,
        motionRate: window.PSYCHO_STATE.motionRate,
        motionDepth: window.PSYCHO_STATE.motionDepth,
        correlationThreshold: window.PSYCHO_STATE.correlationThreshold,
        autoWidthReductionAmount: window.PSYCHO_STATE.autoWidthReductionAmount,
        kickBypassSensitivity: window.PSYCHO_STATE.kickBypassSensitivity,
        wetDryMix: window.PSYCHO_STATE.wetDryMix,
        outputTrimDb: window.PSYCHO_STATE.outputTrimDb,
        outputLimiter: window.PSYCHO_STATE.outputLimiter,
        monoSafety: { ...window.PSYCHO_STATE.safety }
      },
      motor: {
        ...state.motor,
        safety: { ...state.motor.safety },
        guardWarnings: calc.auditMotorSettings(state.motor)
      },
      fxMotion: {
        ...state.fxMotion,
        selectedFamilies: [...state.fxMotion.selectedFamilies],
        safety: { ...state.fxMotion.safety },
        guardWarnings: calc.auditFxMotionSettings(state.fxMotion)
      },
      evidenceFeedback: { ...state.evidenceFeedback },
      audioMetrics: { ...state.audioMetrics },
      causalEvidence: state.evidence,
      sources: state.sources.map(({ type, label, role, preserve, transform, weight }) => ({
        type, label, role, preserve: [...preserve], transform: [...transform], weight
      })),
      customFX: selectedValues(byId('fxPresets')),
      outputs: {
        stylePrompt: byId('styleOutput').textContent,
        multiSourceRequest: byId('sourceOutput').textContent,
        studioBrief: byId('studioOutput').textContent,
        customPluginBrief: byId('fxOutput').textContent,
        psychoStyleTag: byId('psychoStyleOutput').textContent,
        haasAutomationBrief: byId('haasAutomationOutput').textContent,
        haasPluginBrief: byId('haasPluginOutput').textContent,
        motorStyleTag: byId('motorStyleOutput').textContent,
        motorStudioBrief: byId('motorStudioOutput').textContent,
        motorGuard: byId('motorGuardOutput').textContent,
        fxMotionTag: byId('fxStyleOutput').textContent,
        fxMotionPlan: byId('fxPlanOutput').textContent,
        fxMotionAutomationBrief: byId('fxAutomationOutput').textContent,
        evidenceReport: calc.formatProductionEvidence(state.evidence)
      }
    };
    copyText(JSON.stringify(snapshot, null, 2), 'Production snapshot JSON copied.');
  });

  document.addEventListener('app:statechange', renderProduction);
  document.addEventListener('app:tabchange', renderProduction);
  document.addEventListener('app:psychochange', renderProduction);
  bindMotorTools();
  bindFXMotionSystem();
  bindPsychoLab(renderProduction);
  bindEvidenceLab();
  renderSources();
  renderProduction();
}

function bindPsychoLab(renderProduction) {
  const psycho = window.PSYCHO_STATE;
  if (!psycho) throw new Error('Psychoacoustic state did not load.');
  const get = id => document.getElementById(id);
  const fields = [
    ['haasMode', 'haasMode'],
    ['haasTarget', 'haasTarget'],
    ['haasDelay', 'haasDelayMs'],
    ['haasLowCut', 'stereoLowCutHz'],
    ['haasWidth', 'stereoIntensity'],
    ['haasMotion', 'motionRate'],
    ['haasOffset', 'leftRightOffsetMs'],
    ['haasStereoSide', 'stereoSide'],
    ['haasMotionDepth', 'motionDepth'],
    ['haasCorrelationThreshold', 'correlationThreshold'],
    ['haasAutoWidth', 'autoWidthReductionAmount'],
    ['haasKickSensitivity', 'kickBypassSensitivity'],
    ['haasWetDry', 'wetDryMix'],
    ['haasOutputTrim', 'outputTrimDb']
  ];
  const outputFormats = {
    haasDelay: value => `${value} ms`,
    haasLowCut: value => `${value} Hz`,
    haasWidth: value => `${value}%`,
    haasOffset: () => {
      const delay = psycho.haasDelayMs + psycho.leftRightOffsetMs;
      if (psycho.stereoSide === 'left') return `L ${delay} ms / R 0 ms`;
      if (psycho.stereoSide === 'alternating') return `L/R alternating around ${psycho.haasDelayMs} ms`;
      if (psycho.stereoSide === 'random') return `Random L/R around ${psycho.haasDelayMs} ms`;
      return `L 0 ms / R ${delay} ms`;
    },
    haasMotionDepth: value => `${value}%`,
    haasCorrelationThreshold: value => `${Number(value) > 0 ? '+' : ''}${Number(value).toFixed(2)}`,
    haasAutoWidth: value => `${value}%`,
    haasKickSensitivity: value => `${value}%`,
    haasWetDry: value => `${value}%`,
    haasOutputTrim: value => `${Number(value) > 0 ? '+' : ''}${value} dB`
  };

  fields.forEach(([id, key]) => { get(id).value = psycho[key]; });
  Object.entries(psycho.safety).forEach(([key, enabled]) => {
    const button = document.querySelector(`[data-safety="${key}"]`);
    if (!button) return;
    button.classList.toggle('active', enabled);
    button.setAttribute('aria-pressed', String(enabled));
  });
  get('haasLimiter').setAttribute('aria-pressed', String(psycho.outputLimiter));
  get('haasLimiter').textContent = `Output limiter: ${psycho.outputLimiter ? 'ON' : 'OFF'}`;

  const sync = (preservePreset = false) => {
    fields.forEach(([id, key]) => {
      const value = get(id).type === 'range' ? Number(get(id).value) : get(id).value;
      psycho[key] = value;
      const output = get(`${id}Out`);
      if (output) output.value = (outputFormats[id] || (v => v))(value);
    });
    if (!preservePreset) get('haasPreset').value = 'custom';
    get('haasOffsetOut').value = outputFormats.haasOffset();
    window.APP_updatePsychoOutput?.();
    renderProduction();
  };

  fields.forEach(([id]) => {
    const field = get(id);
    field.addEventListener(field.type === 'range' ? 'input' : 'change', () => sync());
  });
  get('haasSafety').addEventListener('click', event => {
    const button = event.target.closest('[data-safety]');
    if (!button) return;
    const key = button.dataset.safety;
    psycho.safety[key] = !psycho.safety[key];
    get('haasPreset').value = 'custom';
    button.classList.toggle('active', psycho.safety[key]);
    button.setAttribute('aria-pressed', String(psycho.safety[key]));
    window.APP_updatePsychoOutput?.();
    renderProduction();
  });
  get('haasLimiter').addEventListener('click', event => {
    psycho.outputLimiter = !psycho.outputLimiter;
    get('haasPreset').value = 'custom';
    event.currentTarget.setAttribute('aria-pressed', String(psycho.outputLimiter));
    event.currentTarget.textContent = `Output limiter: ${psycho.outputLimiter ? 'ON' : 'OFF'}`;
    renderProduction();
  });
  get('haasPreset').addEventListener('change', event => {
    const presetName = event.currentTarget.value;
    if (presetName === 'custom') return;
    const preset = window.HAAS_SENTINEL_PRESETS?.[presetName];
    if (!preset) {
      event.currentTarget.value = 'custom';
      window.APP_showToast?.('Preset is unavailable; your current settings were kept.');
      return;
    }
    Object.assign(psycho, preset);
    psycho.safety = { ...preset.safety };
    fields.forEach(([id, key]) => { get(id).value = psycho[key]; });
    Object.entries(psycho.safety).forEach(([key, enabled]) => {
      const button = document.querySelector(`[data-safety="${key}"]`);
      if (!button) return;
      button.classList.toggle('active', enabled);
      button.setAttribute('aria-pressed', String(enabled));
    });
    get('haasLimiter').setAttribute('aria-pressed', String(psycho.outputLimiter));
    get('haasLimiter').textContent = `Output limiter: ${psycho.outputLimiter ? 'ON' : 'OFF'}`;
    sync(true);
    window.APP_showToast?.(`${event.currentTarget.selectedOptions[0].textContent} preset loaded.`);
  });
  get('haasPreset').value = 'darkForestSafe';
  sync(true);
}

document.addEventListener('DOMContentLoaded', initProductionEngine, { once: true });

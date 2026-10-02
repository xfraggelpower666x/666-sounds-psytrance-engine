'use strict';

const {
  WILD_MUTATION_POOL,
  buildWildDirective,
  buildModelDirective,
  buildStylePrompt,
  buildSourceRequest,
  buildStudioBrief,
  buildEffectBrief,
  buildPsychoStyleTag,
  buildPsychoStudioBrief,
  buildHaasBrief,
  buildTrackHaasGuide,
  MOTOR_PRESETS,
  MOTOR_SAFETY_DEFAULTS,
  FX_MOTION_DEFAULTS,
  FX_MOTION_FAMILIES,
  buildMotorStyleTag,
  buildMotorStudioBrief,
  auditMotorSettings,
  buildFxMotionTag,
  buildFxMotionPlan,
  buildFxMotionBrief,
  auditFxMotionSettings,
  evaluateCausalRules,
  buildSemanticInterpretation,
  findSemanticConflicts,
  buildProductionEvidenceState,
  formatProductionEvidence,
  auditPsychoSettings,
  findProductionConflicts
} = require('../src/production.calc');

describe('Production Engine prompt builders', () => {
  const hardAnchors = {
    genre: 'Dark Psy psytrance',
    tempo: '148 BPM',
    rhythm: 'rolling 16th-note bassline',
    tonalCenter: 'Phrygian tension',
    mix: 'tight kick-bass separation with huge controlled low-end'
  };

  test('wild directive uses mutation pool and retains hard anchors', () => {
    const directive = buildWildDirective({
      weirdness: 86,
      influence: 86,
      diversity: 0,
      hardAnchors
    });
    expect(directive).toContain('Mutation intensity: high.');
    expect(directive).toContain('unstable granular resampling');
    expect(directive).toContain('Keep the rhythmic, tempo and genre anchors strict.');
    expect(directive).toContain('rolling 16th-note bassline');
    expect(directive).toContain('functional dancefloor groove');
    expect(WILD_MUTATION_POOL).toHaveLength(10);
  });

  test.each([
    [49, 'low'],
    [50, 'medium'],
    [80, 'high']
  ])('weirdness %s selects the %s mutation level', (weirdness, expectedLevel) => {
    expect(buildWildDirective({ weirdness })).toContain(`Mutation intensity: ${expectedLevel}.`);
  });

  test('non-wild profiles also preserve the shared Core anchors', () => {
    expect(buildModelDirective('v6', { hardAnchors })).toContain('148 BPM');
    expect(buildModelDirective('v6-mini', { hardAnchors })).toContain('Phrygian tension');
  });

  test('style prompt composes shared Core and enforces the output character limit', () => {
    const prompt = buildStylePrompt({
      corePrompt: 'Dark Psy psytrance, 148 BPM, Phrygian',
      model: 'v6',
      settings: { influence: 82, diversity: 24, hardAnchors },
      duration: '06:00',
      customStyle: '666SD_PsyTrance',
      negativeStyle: 'pop hooks, trap drums',
      limit: 240
    });
    expect(prompt.text).toContain('Dark Psy psytrance');
    expect(prompt.text.length).toBeLessThanOrEqual(240);
    expect(prompt.truncated).toBe(true);
  });

  test('source request includes role, preservation, transformation, weight and originality rule', () => {
    const request = buildSourceRequest([{
      type: 'AUDIO',
      label: 'my_bassline.wav',
      role: 'Rhythmic movement only',
      preserve: ['bass rhythm', 'energy'],
      transform: ['timbre', 'sound design'],
      weight: 'Primary'
    }], 'Preserve the hypnotic energy.');
    expect(request).toContain('Weight: Primary');
    expect(request).toContain('Role: Rhythmic movement only');
    expect(request).toContain('Preserve: bass rhythm, energy');
    expect(request).toContain('Transform: timbre, sound design');
    expect(request).toContain('rather than reproducing any source literally');
  });

  test('empty source list still yields a useful Core-based request', () => {
    expect(buildSourceRequest([], 'Dark ritual in a cavern'))
      .toContain('Concept intent: Dark ritual in a cavern');
  });

  test('Studio and effect briefs reflect the selected targets and presets', () => {
    const studio = buildStudioBrief({
      targets: ['Stem separation', 'Create MIDI'],
      effects: ['SUB VOID GLUE'],
      bpm: 148,
      subgenre: 'Dark Psy',
      mix: 'huge low-end'
    });
    expect(studio).toContain('Stem separation, Create MIDI');
    expect(studio).toContain('Dark Psy psytrance, 148 BPM');
    expect(studio).toContain('SUB VOID GLUE');
    expect(buildEffectBrief(['CAVE SPIRAL'])).toContain('convolution reverb');
    expect(buildEffectBrief(['ORGANIC DEPTH FIELD'])).toContain('near, middle and far depth layers');
    expect(buildEffectBrief([])).toContain('No custom effect selected');
  });

  test('Haas design accepts shared Psycho state keys and emits Dark Forest Safe Width values', () => {
    const brief = buildEffectBrief(['HAAS SENTINEL'], {
      haasMode: 'automated',
      haasTarget: 'acid harmonics',
      stereoLowCutHz: 300,
      haasDelayMs: 15,
      stereoIntensity: 55,
      leftRightOffsetMs: 0,
      motionRate: 'slow',
      motionDepth: 12,
      correlationThreshold: 0.15,
      autoWidthReductionAmount: 70,
      kickBypassSensitivity: 60,
      wetDryMix: 45,
      outputTrimDb: 0,
      outputLimiter: true,
      safety: {
        subMono: true,
        sideLowCut: true,
        correlationMonitor: true,
        kickTransientBypass: true,
        autoWidthReduction: true
      }
    });
    expect(brief).toContain('real-time psychoacoustic stereo-width audio effect plugin');
    expect(brief).toContain('Left 0 ms, Right 15 ms');
    expect(brief).toContain('300 Hz');
    expect(brief).toContain('55% width');
    expect(brief).toContain('45% Wet/Dry');
    expect(brief).toContain('Slow Drift at 12%');
    expect(brief).toContain('Dark Forest Safe Width');
    expect(brief).toContain('Correlation Threshold');
  });

  test('Studio brief includes the ordered FX chain and drop-focused automation', () => {
    const brief = buildPsychoStudioBrief({
      mode: 'automated',
      target: 'acid harmonics',
      delayMs: 15,
      lowCutHz: 300,
      intensity: 55,
      motion: 'slow',
      offsetMs: 0,
      motionDepth: 12,
      correlationThreshold: 0.15,
      autoWidthReductionAmount: 70,
      kickBypassSensitivity: 60,
      wetDryMix: 45,
      outputTrimDb: 0,
      outputLimiter: true,
      safety: {
        subMono: true,
        sideLowCut: true,
        correlationMonitor: true,
        kickTransientBypass: true,
        autoWidthReduction: true
      }
    });
    expect(brief).toContain('1. EQ  2. Distortion  3. HAAS SENTINEL  4. Tempo-synced Delay');
    expect(brief).toContain('Bar 16, beat 4: Width 15%');
    expect(brief).toContain('Immediately after the drop');
    expect(brief).toContain('correlation-based auto-width reduction');
    expect(brief).toContain('Mono, centered; do not instantiate HAAS SENTINEL');
    expect(brief).toContain('Creature / insect / glitch FX');
  });

  test('kick and sub targets never receive Haas style or plugin processing', () => {
    expect(buildPsychoStyleTag({ mode: 'automated', target: 'kick' }))
      .toContain('mono-compatible low-end');
    expect(buildHaasBrief({ mode: 'automated', target: 'subbass' }))
      .toContain('not applied to subbass');
    expect(buildPsychoStudioBrief({ mode: 'automated', target: 'kick' }))
      .toContain('no stereo delay, Haas or side signal');
    expect(auditPsychoSettings({
      mode: 'automated',
      target: 'kick',
      safety: { subMono: true, correlationMonitor: true }
    }).join(' ')).toContain('dürfen nicht durch HAAS SENTINEL verarbeitet werden');
  });

  test('track starting-point guide records protected, selective and effect-specific ranges', () => {
    const guide = buildTrackHaasGuide();
    expect(guide).toContain('Subbass below 120 Hz | Haas: No');
    expect(guide).toContain('high-pass 180-250 Hz; 8-14 ms');
    expect(guide).toContain('400-700 Hz (from about 500 Hz); 15-30 ms');
    expect(guide).toContain('500 Hz low cut; 15-40 ms');
  });

  test('automation and mono-check brief includes the extended sequence and external verification', () => {
    const brief = buildPsychoStudioBrief({
      mode: 'automated',
      target: 'acid harmonics',
      delayMs: 15,
      lowCutHz: 300,
      intensity: 55,
      motion: 'slow',
      offsetMs: 0,
      motionDepth: 12,
      correlationThreshold: 0.15,
      autoWidthReductionAmount: 70,
      kickBypassSensitivity: 60,
      wetDryMix: 45,
      outputLimiter: true,
      safety: {
        subMono: true,
        sideLowCut: true,
        correlationMonitor: true,
        kickTransientBypass: true,
        autoWidthReduction: true
      }
    });
    expect(brief).toContain('Bars 25-32: Width 65%');
    expect(brief).toContain('Final transition: Width 75%');
    expect(brief).toContain('MIDI Learn');
    expect(brief).toContain('external DAW/analyzer for a true mono sum');
    expect(brief).toContain('do not assume Studio 2 provides a mono-sum switch or correlation meter');
    expect(brief).toContain('listen for lost kick punch');
  });

  test('builder defaults and optional-field fallbacks remain useful', () => {
    expect(buildWildDirective({
      weirdness: 0,
      influence: 0,
      diversity: 100,
      hardAnchors: { groove: '' }
    })).toContain('Allow controlled genre hybridization');
    expect(buildWildDirective({ diversity: 70 })).toContain('Create a radically distinct interpretation.');
    expect(buildModelDirective('v6', { weirdness: 70 })).toContain('restrained experimental details');
    expect(buildModelDirective('v6-mini')).toContain('Fast exploratory sketch');
    expect(buildModelDirective('v6-mini')).not.toContain('Retain these anchors');
    expect(buildStylePrompt({
      corePrompt: ', ,',
      maxMode: false,
      customStyle: '',
      psychoStyleTag: '',
      negativeStyle: '',
      limit: 100
    })).toEqual({ text: 'target duration 06:00', truncated: true, limit: 100 });
    expect(buildSourceRequest([{ label: '', role: '' }], ''))
      .toContain('Use the shared Core prompt as the complete creative brief');
    expect(buildSourceRequest([{
      type: '',
      label: 'source.wav',
      role: '',
      preserve: 'kick, acid',
      transform: 'reverb',
      weight: ''
    }], '')).toContain('Preserve: kick, acid');
    expect(buildStudioBrief()).toContain('Targets: Full generation');
    expect(buildPsychoStyleTag({ mode: 'off' })).toContain('mono-compatible low-end');
    expect(buildPsychoStyleTag({ mode: 'automated', motion: 'unknown' }))
      .toContain('static stereo width');
  });

  test('Haas builder covers disabled protections, limiter-off and long-delay warning', () => {
    const brief = buildHaasBrief({
      mode: 'static',
      target: 'acid harmonics',
      delayMs: 31,
      safety: {
        subMono: false,
        sideLowCut: false,
        correlationMonitor: false,
        kickTransientBypass: false,
        autoWidthReduction: false,
        dropOnlyActivation: true
      },
      outputLimiter: false
    });
    expect(brief).toContain('enable the effect only during the drop');
    expect(brief).toContain('Output Safety Limiter: Off');
    expect(brief).toContain('Caution: this delay may create audible pre-echo');
    expect(buildHaasBrief({ safety: {} })).toContain('leave the low band below 250 Hz centered');
    expect(buildHaasBrief({
      safety: {
        subMono: false,
        sideLowCut: false,
        correlationMonitor: false,
        kickTransientBypass: false,
        autoWidthReduction: false
      }
    })).toContain('Safety: mono-check the result');
  });

  test('Studio brief covers off mode, false safety toggles and alternate motion labels', () => {
    expect(buildPsychoStudioBrief()).toContain('Haas movement: Off');
    const brief = buildPsychoStudioBrief({
      mode: 'static',
      target: 'acid harmonics',
      motion: 'none',
      outputLimiter: false,
      safety: {
        sideLowCut: false,
        subMono: false,
        correlationMonitor: false,
        kickTransientBypass: false,
        autoWidthReduction: false
      }
    });
    expect(brief).toContain('static stereo spread');
    expect(brief).toContain('no movement');
    expect(brief).toContain('WARNING: sub-mono protection is disabled');
    expect(brief).toContain('WARNING: correlation monitoring is disabled');
    expect(brief).toContain('Output limiter: Off');
  });
});

describe('Production Engine guard conflicts', () => {
  test('high wildness flags meditative targets and insufficient sonic anchors', () => {
    const warnings = findProductionConflicts({
      model: 'v6-wild',
      weirdness: 86,
      moods: ['Meditative'],
      sonic: ['acid bassline']
    });
    expect(warnings).toHaveLength(2);
    expect(warnings[0]).toContain('meditative target');
    expect(warnings[1]).toContain('two concrete sonic anchors');
  });

  test('reports the Zenonesque tempo and low-end identity conflicts', () => {
    const warnings = findProductionConflicts({
      bpm: 160,
      subgenre: 'Zenonesque',
      mix: 'huge low-end',
      sonic: ['deep 808 sub bass', 'acid bassline 303']
    });
    expect(warnings).toHaveLength(2);
    expect(warnings.join(' ')).toContain('unusual at this BPM');
    expect(warnings.join(' ')).toContain('primary bass identity');
  });

  test('allows intentional low wildness and compatible anchors without warnings', () => {
    expect(findProductionConflicts({
      model: 'v6-wild',
      weirdness: 55,
      moods: ['Hypnotic'],
      sonic: ['rolling bass', 'tribal percussion'],
      bpm: 148,
      subgenre: 'Dark Psy',
      mix: 'tight club translation'
    })).toEqual([]);
  });

  test('psycho audit catches low cuts, risky delay, restless drone motion and disabled safety', () => {
    const warnings = auditPsychoSettings({
      mode: 'automated',
      target: 'atmospheric drones',
      lowCutHz: 100,
      delayMs: 35,
      intensity: 80,
      motion: 'sixteenth',
      safety: { subMono: false, correlationMonitor: false }
    });
    expect(warnings).toHaveLength(4);
    expect(warnings.join(' ')).toContain('unter 120 Hz');
    expect(warnings.join(' ')).toContain('Echo-Wahrnehmung');
    expect(warnings.join(' ')).toContain('für lange Drones');
    expect(warnings.join(' ')).toContain('Safety-Guard');
  });

  test('psycho audit allows disabled Haas and identifies the mid-bass crossover minimum', () => {
    expect(auditPsychoSettings({ mode: 'off', lowCutHz: 80 })).toEqual([]);
    const warnings = auditPsychoSettings({
      mode: 'automated',
      target: 'mid-bass texture',
      lowCutHz: 150,
      safety: { subMono: true, correlationMonitor: true }
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('Side-Low-Cut ab mindestens 180 Hz');
  });
});

describe('Psytrance Motor Tools', () => {
  const darkRolling = {
    preset: 'darkRolling',
    ...MOTOR_PRESETS.darkRolling,
    safety: { ...MOTOR_SAFETY_DEFAULTS }
  };

  test('factory presets match the supplied motor defaults and specialty profiles', () => {
    expect(darkRolling).toMatchObject({
      bassPattern: 'rolling16',
      kickStyle: 'dryPunch',
      kickLengthMs: 90,
      kickClick: 26,
      bassNoteLength: 72,
      bassDrive: 38,
      rubberMovement: 18,
      grooveTightness: 92
    });
    expect(MOTOR_PRESETS.forestRubber).toMatchObject({
      bassPattern: 'rolling16',
      kickStyle: 'forestKnock',
      kickLengthMs: 105,
      rubberMovement: 46
    });
    expect(MOTOR_PRESETS.hitechPressure).toMatchObject({
      kickStyle: 'hitechSnap',
      kickLengthMs: 58,
      kickClick: 58,
      grooveTightness: 98
    });
    expect(MOTOR_PRESETS.zenoPulse).toMatchObject({
      bassPattern: 'offbeat',
      kickStyle: 'deepThump',
      kickLengthMs: 125
    });
  });

  test('motor tag and Studio brief carry selected values and low-end protections', () => {
    expect(buildMotorStyleTag(darkRolling)).toContain('relentless rolling 1/16 bassline');
    const brief = buildMotorStudioBrief({ ...darkRolling, bpm: 148, subgenre: 'Dark Psy' });
    expect(brief).toContain('Dark Psy psytrance at 148 BPM');
    expect(brief).toContain('Target length: 90 ms. Click intensity: 26%.');
    expect(brief).toContain('Keep the fundamental sub mono below 120 Hz');
    expect(brief).toContain('Do not widen the core bass fundamental');
    expect(auditMotorSettings(darkRolling)).toEqual([]);
  });

  test('motor guard identifies disabled protection and low-end overlap', () => {
    const warnings = auditMotorSettings({
      ...darkRolling,
      kickLengthMs: 150,
      bassNoteLength: 90,
      safety: { ...MOTOR_SAFETY_DEFAULTS, kickMono: false, lowEndGuard: false }
    });
    expect(warnings).toContain('Kick mono protection is disabled.');
    expect(warnings).toContain('Low-end collision guard is disabled.');
    expect(warnings).toContain('Kick and bass are both too long: potential low-end overlap.');
  });
});

describe('Intelligent FX Motion System', () => {
  const forestMotion = {
    ...FX_MOTION_DEFAULTS,
    selectedFamilies: [...FX_MOTION_DEFAULTS.selectedFamilies],
    safety: { ...FX_MOTION_DEFAULTS.safety }
  };

  test('FX family lens, subgenre profile and arrangement phase shape all output variants', () => {
    expect(FX_MOTION_FAMILIES['Forest FX'].role).toContain('Organic');
    expect(buildFxMotionTag(forestMotion)).toContain('Forest Psy');
    expect(buildFxMotionTag(forestMotion)).toContain('organic, dark, alive');
    expect(buildFxMotionPlan(forestMotion)).toContain('Use short, controlled call-and-response FX');
    expect(buildFxMotionPlan({ ...forestMotion, phase: 'predrop' }))
      .toContain('Reduce FX density, pull width inward and maximize tension');
    expect(buildFxMotionBrief({ ...forestMotion, phase: 'drop' }))
      .toContain('Kick and rolling bass lead; restore FX afterward');
  });

  test('FX motion guards catch chaotic density, drop masking and disabled protection', () => {
    const warnings = auditFxMotionSettings({
      ...forestMotion,
      phase: 'drop',
      density: 90,
      chaos: 82,
      safety: { ...forestMotion.safety, protectKick: false }
    });
    expect(warnings).toContain('Kick protection is disabled.');
    expect(warnings).toContain('High FX density plus high chaos can hide the groove.');
    expect(warnings).toContain('High FX density at drop start may weaken kick-bass impact.');
  });
});

describe('Semantic causal evidence', () => {
  const context = {
    model: 'v6',
    core: { genre: 'Dark Psy', bpm: 148, scale: 'Phrygian', moods: [], sonicElements: [] },
    motor: {
      preset: 'darkRolling',
      ...MOTOR_PRESETS.darkRolling,
      safety: { ...MOTOR_SAFETY_DEFAULTS }
    },
    psycho: {
      mode: 'automated',
      target: 'acid harmonics',
      stereoLowCutHz: 300,
      width: 55,
      wetDry: 45,
      safety: { subMono: true, correlationMonitor: true }
    },
    fx: {
      family: 'Forest FX',
      subgenre: 'forest',
      phase: 'groove',
      motion: 'organic',
      energy: 62,
      tension: 56,
      density: 42,
      width: 68,
      chaos: 35,
      space: 58,
      selectedFamilies: ['Organic Creature FX'],
      safety: { ...FX_MOTION_DEFAULTS.safety }
    }
  };

  test('causal rules emit traceable claims with matched context and evidence sources', () => {
    const claims = evaluateCausalRules(context);
    expect(claims.map(claim => claim.ruleId)).toEqual(expect.arrayContaining([
      'MOTOR.DRY_KICK.PROTECTION',
      'MOTOR.DRY_KICK.ROLLING_BASS',
      'PSYCHO.HAAS.MONO_SAFE',
      'PSYCHO.HAAS.ACID_WIDTH_AUDIBLE',
      'FOREST.ORGANIC.MOTION'
    ]));
    expect(claims[0]).toMatchObject({
      type: 'causal',
      status: 'supported',
      context: { genre: 'Dark Psy', bpm: 148 }
    });
    expect(claims[0].evidence.some(item => item.type === 'user_selection')).toBe(true);
  });

  test('semantic layer maps selected language and flags contradictory intent', () => {
    expect(buildSemanticInterpretation(context).map(entry => entry.term))
      .toEqual(expect.arrayContaining(['darkpsy', 'dryPunch', 'rolling16', 'acidHarmonics', 'haasSafe']));
    expect(findSemanticConflicts({
      ...context,
      core: { ...context.core, moods: ['Happy', 'Major-key melody'] }
    })).toHaveLength(1);
  });

  test('manual reviews and DAW correlation update confidence with explicit evidence', () => {
    const baseline = buildProductionEvidenceState({ context });
    const reviewed = buildProductionEvidenceState({
      context,
      feedback: { subMonoStable: '5', acidWidthAudible: '5' },
      audioMetrics: { stereoCorrelation: '0.42' }
    });
    const baselineAcid = baseline.claims.find(claim => claim.ruleId === 'PSYCHO.HAAS.ACID_WIDTH_AUDIBLE');
    const reviewedAcid = reviewed.claims.find(claim => claim.ruleId === 'PSYCHO.HAAS.ACID_WIDTH_AUDIBLE');
    expect(reviewedAcid.confidence).toBeGreaterThan(baselineAcid.confidence);
    expect(reviewedAcid.evidence.some(item => item.type === 'user_rating')).toBe(true);
    expect(reviewedAcid.evidence.some(item => item.type === 'audio_metric')).toBe(true);

    const poorReview = buildProductionEvidenceState({
      context,
      feedback: { subMonoStable: '1' },
      audioMetrics: { stereoCorrelation: '-0.2' }
    });
    expect(poorReview.risk).toBe('high');
    expect(poorReview.conflicts.join(' ')).toContain('below the +0.15 review threshold');
    expect(formatProductionEvidence(poorReview)).toContain('MANUAL AUDIO REVIEW');
  });

  test('style prompt includes supported causal effects and evidence states its limits', () => {
    const prompt = buildStylePrompt({
      corePrompt: 'Dark Psy, 148 BPM',
      evidenceClaims: ['Stable kick-bass separation'],
      limit: 1000
    });
    expect(prompt.text).toContain('Production intent: Stable kick-bass separation');
    const evidence = buildProductionEvidenceState({
      context,
      stylePrompt: prompt.text,
      studioBrief: 'Studio plan'
    });
    expect(evidence.auditTrail.map(entry => entry.stage)).toContain('SNAPSHOT');
    expect(evidence.evidenceScope).toContain('no audio signal is analyzed');
    expect(evidence.generated.studioBrief).toBe('Studio plan');
  });
});

/**
 * psycho.calc.js
 * 666 SOUNDS DESIGN — Pure calculation module (no DOM, no Canvas)
 * Extracted from psycho.js for unit-testability.
 *
 * All functions are pure: same input → same output, no side effects.
 */

'use strict';

// ─────────────────────────────────────────────────────────────
// CONSCIOUSNESS PROFILES
// ─────────────────────────────────────────────────────────────

const PSYCHO_PROFILES = {
  trance:     { name: 'Trance',      hz: 6,     band: 'theta'   },
  flow:       { name: 'Flow',        hz: 10,    band: 'alpha'   },
  hypnose:    { name: 'Hypnose',     hz: 3.5,   band: 'delta'   },
  ekstase:    { name: 'Ekstase',     hz: 40,    band: 'gamma'   },
  meditation: { name: 'Meditation',  hz: 5,     band: 'theta'   },
  ritual:     { name: 'Ritual',      hz: 7.83,  band: 'schumann' }
};

// ─────────────────────────────────────────────────────────────
// HAAS ZONES
// ─────────────────────────────────────────────────────────────

const HAAS_ZONES = [
  { min: 1,  max: 5,  zone: 'Fusion',   effect: 'Mono-kompatibel, Stereo-Erweiterung' },
  { min: 6,  max: 15, zone: 'Presence', effect: 'Haas-Zone: Space ohne Echo'           },
  { min: 16, max: 25, zone: 'Width',    effect: 'Maximale Stereobreite'                },
  { min: 26, max: 35, zone: 'Pre-Echo', effect: 'Grenze: leichtes Pre-Echo hörbar'    }
];

// ─────────────────────────────────────────────────────────────
// ROOM PRESETS
// ─────────────────────────────────────────────────────────────

const ROOM_PRESETS = {
  tight:  { name: 'Tight Studio', rt60: 0.3,  tag: 'tight dry studio'              },
  club:   { name: 'Club',         rt60: 0.8,  tag: 'club room reverb'               },
  cave:   { name: 'Cave',         rt60: 2.5,  tag: 'deep cave reverb'               },
  cosmic: { name: 'Cosmic Void',  rt60: 8.0,  tag: 'infinite cosmic space reverb'   }
};

// ─────────────────────────────────────────────────────────────
// BINAURAL CALCULATIONS
// ─────────────────────────────────────────────────────────────

/**
 * Calculate binaural beat parameters.
 * @param {number} carrier  - Carrier frequency in Hz (L channel)
 * @param {string} profileId - One of the PSYCHO_PROFILES keys
 * @returns {{ carrierL: number, carrierR: number, beatHz: number, band: string }}
 */
function calcBinaural(carrier, profileId) {
  const profile = PSYCHO_PROFILES[profileId];
  if (!profile) throw new Error(`Unknown profile: ${profileId}`);
  if (carrier <= 0) throw new Error('Carrier frequency must be > 0');

  return {
    carrierL: carrier,
    carrierR: carrier + profile.hz,
    beatHz:   profile.hz,
    band:     profile.band
  };
}

/**
 * Validate that a carrier frequency is within safe listening range (50–1000 Hz).
 * @param {number} carrier
 * @returns {boolean}
 */
function isValidCarrier(carrier) {
  return typeof carrier === 'number' && carrier >= 50 && carrier <= 1000;
}

// ─────────────────────────────────────────────────────────────
// HAAS EFFECT CALCULATIONS
// ─────────────────────────────────────────────────────────────

/**
 * Get Haas zone classification for a given delay.
 * @param {number} delayMs - Delay in milliseconds (1–35)
 * @returns {{ zone: string, effect: string } | null}
 */
function getHaasZone(delayMs) {
  return HAAS_ZONES.find(z => delayMs >= z.min && delayMs <= z.max) || null;
}

/**
 * Validate Haas delay is within the classic Haas effect range.
 * @param {number} delayMs
 * @returns {boolean}
 */
function isHaasRange(delayMs) {
  return typeof delayMs === 'number' && delayMs >= 1 && delayMs <= 35;
}

/**
 * Determine if a Haas delay is in the fusion zone (≤ 5ms = mono-compatible).
 * @param {number} delayMs
 * @returns {boolean}
 */
function isHaasFusionZone(delayMs) {
  return delayMs >= 1 && delayMs <= 5;
}

/**
 * Determine if a Haas delay is in the pre-echo danger zone (> 25ms).
 * @param {number} delayMs
 * @returns {boolean}
 */
function isHaasPreEchoRisk(delayMs) {
  return delayMs > 25;
}

// ─────────────────────────────────────────────────────────────
// ISOCHRONIC PULSE CALCULATIONS
// ─────────────────────────────────────────────────────────────

/**
 * Calculate isochronic pulse parameters for a given brainwave frequency.
 * @param {number} hz - Brainwave frequency in Hz
 * @returns {{ periodMs: number, pulseOnMs: number, pulseOffMs: number, bpmEquivalent: number }}
 */
function calcIsochronic(hz) {
  if (hz <= 0) throw new Error('Frequency must be > 0');
  const periodMs    = 1000 / hz;
  const pulseOnMs   = periodMs * 0.5;
  const pulseOffMs  = periodMs * 0.5;
  const bpmEquivalent = hz * 60;
  return { periodMs, pulseOnMs, pulseOffMs, bpmEquivalent };
}

/**
 * Check that isochronic frequency falls in a clinically recognised brainwave band.
 * @param {number} hz
 * @returns {'delta'|'theta'|'alpha'|'beta'|'gamma'|'unknown'}
 */
function classifyBrainwaveBand(hz) {
  if (hz >= 0.5 && hz < 4)   return 'delta';
  if (hz >= 4   && hz < 8)   return 'theta';
  if (hz >= 8   && hz < 13)  return 'alpha';
  if (hz >= 13  && hz < 30)  return 'beta';
  if (hz >= 30)              return 'gamma';
  return 'unknown';
}

// ─────────────────────────────────────────────────────────────
// ROOM ACOUSTICS
// ─────────────────────────────────────────────────────────────

/**
 * Get room preset by ID.
 * @param {string} presetId
 * @returns {{ name: string, rt60: number, tag: string }}
 */
function getRoomPreset(presetId) {
  const preset = ROOM_PRESETS[presetId];
  if (!preset) throw new Error(`Unknown room preset: ${presetId}`);
  return preset;
}

/**
 * Estimate early reflection delay from RT60 (simplified Sabine approximation).
 * Returns first reflection onset in ms.
 * @param {number} rt60 - Reverberation time in seconds
 * @param {number} roomVolumeM3 - Approximate room volume in m³ (default 200 m³)
 * @returns {number} Early reflection onset in ms
 */
function estimateEarlyReflection(rt60, roomVolumeM3 = 200) {
  if (rt60 <= 0) throw new Error('RT60 must be > 0');
  // Sabine: RT60 = 0.161 * V / A  →  A = 0.161 * V / RT60
  const absorptionArea = (0.161 * roomVolumeM3) / rt60;
  // Rough early reflection onset: sqrt(V/A) * 1000ms
  const onsetMs = Math.sqrt(roomVolumeM3 / absorptionArea) * 1000;
  return parseFloat(onsetMs.toFixed(2));
}

/**
 * Build the Suno tag string for given active psychoacoustic effects.
 * @param {{ binaural?: boolean, haas?: boolean, isochronic?: boolean, room?: boolean }} effects
 * @param {string} profileId
 * @param {number} haasDelayMs
 * @param {string} roomPresetId
 * @returns {string}
 */
function buildPsychoTags(effects, profileId, haasDelayMs, roomPresetId) {
  const profile = PSYCHO_PROFILES[profileId];
  if (!profile) throw new Error(`Unknown profile: ${profileId}`);
  const tags = [];
  if (effects.binaural)   tags.push(`binaural ${profile.hz}Hz ${profile.band}`);
  if (effects.haas)       tags.push(`Haas stereo ${haasDelayMs}ms`);
  if (effects.isochronic) tags.push(`isochronic ${profile.hz}Hz pulse`);
  if (effects.room) {
    const room = ROOM_PRESETS[roomPresetId];
    if (!room) throw new Error(`Unknown room preset: ${roomPresetId}`);
    tags.push(room.tag);
  }
  return tags.join(', ');
}

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

module.exports = {
  PSYCHO_PROFILES,
  HAAS_ZONES,
  ROOM_PRESETS,
  calcBinaural,
  isValidCarrier,
  getHaasZone,
  isHaasRange,
  isHaasFusionZone,
  isHaasPreEchoRisk,
  calcIsochronic,
  classifyBrainwaveBand,
  getRoomPreset,
  estimateEarlyReflection,
  buildPsychoTags
};

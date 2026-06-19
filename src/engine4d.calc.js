/**
 * engine4d.calc.js
 * 666 SOUNDS DESIGN — Pure 4D spatial calculation module (no DOM, no Canvas)
 * Extracted from engine4d.js for unit-testability.
 *
 * All functions are pure: same input → same output, no side effects.
 * Physical constants: speed of sound = 343 m/s, head radius = 0.0875 m
 */

'use strict';

// ─────────────────────────────────────────────────────────────
// PHYSICAL CONSTANTS
// ─────────────────────────────────────────────────────────────

const SPEED_OF_SOUND = 343;      // m/s at 20°C
const HEAD_RADIUS    = 0.0875;   // metres (average adult)
const AIR_ABS_COEFF  = 0.002;    // dB/m at 1 kHz (ISO 9613-1 approximation)

// ─────────────────────────────────────────────────────────────
// AMBISONIC ORDERS
// ─────────────────────────────────────────────────────────────

const AMBISONIC_ORDERS = [
  { order: 0, label: 'Stereo', channels: 2,  tag: 'stereo field'          },
  { order: 1, label: 'FOA',    channels: 4,  tag: '1st order ambisonics'  },
  { order: 2, label: 'SOA',    channels: 9,  tag: '2nd order ambisonics'  },
  { order: 3, label: 'TOA',    channels: 16, tag: '3rd order ambisonics'  }
];

// ─────────────────────────────────────────────────────────────
// HELPER: degrees ↔ radians
// ─────────────────────────────────────────────────────────────

const toRad = deg => deg * (Math.PI / 180);
const toDeg = rad => rad * (180 / Math.PI);

// ─────────────────────────────────────────────────────────────
// ILD — Interaural Level Difference
// ─────────────────────────────────────────────────────────────

/**
 * Calculate ILD (Interaural Level Difference) in dB.
 * Uses the simplified duplex model: ILD ≈ 6 * sin(azimuth).
 * Positive = louder in right ear, negative = louder in left ear.
 *
 * @param {number} azimuthDeg - Azimuth angle in degrees (-180 to +180)
 * @returns {number} ILD in dB (rounded to 2 decimal places)
 */
function calcILD(azimuthDeg) {
  const ild = Math.sin(toRad(azimuthDeg)) * 6;
  return parseFloat(ild.toFixed(2));
}

// ─────────────────────────────────────────────────────────────
// ITD — Interaural Time Difference
// ─────────────────────────────────────────────────────────────

/**
 * Calculate ITD (Interaural Time Difference) in milliseconds.
 * Uses Woodworth's formula: ITD = (r/c) * (θ + sin(θ))
 * where r = head radius, c = speed of sound, θ = azimuth in radians.
 *
 * @param {number} azimuthDeg - Azimuth angle in degrees (-180 to +180)
 * @returns {number} ITD in ms (positive = right-ear leading, rounded to 3 dp)
 */
function calcITD(azimuthDeg) {
  const theta = toRad(azimuthDeg);
  const itdSeconds = (HEAD_RADIUS / SPEED_OF_SOUND) * (theta + Math.sin(theta));
  return parseFloat((itdSeconds * 1000).toFixed(3));
}

/**
 * Maximum theoretical ITD at 90° azimuth (reference value).
 * @returns {number} Max ITD in ms
 */
function maxITD() {
  return calcITD(90);
}

// ─────────────────────────────────────────────────────────────
// AIR ABSORPTION
// ─────────────────────────────────────────────────────────────

/**
 * Estimate high-frequency air absorption loss over a given distance.
 * Approximation for 1 kHz (ISO 9613-1).
 *
 * @param {number} distanceM - Source distance in metres
 * @returns {number} Absorption loss in dB (rounded to 3 dp)
 */
function calcAirAbsorption(distanceM) {
  if (distanceM < 0) throw new Error('Distance must be >= 0');
  return parseFloat((distanceM * AIR_ABS_COEFF).toFixed(3));
}

// ─────────────────────────────────────────────────────────────
// DOPPLER PITCH SHIFT
// ─────────────────────────────────────────────────────────────

/**
 * Calculate Doppler frequency ratio for a source moving toward the listener.
 * f_observed / f_source = c / (c - v_source)
 *
 * @param {number} sourceSpeedMs - Source speed in m/s (positive = approaching)
 * @returns {number} Frequency ratio (> 1 = pitch up, < 1 = pitch down, rounded to 4 dp)
 */
function calcDopplerRatio(sourceSpeedMs) {
  if (sourceSpeedMs >= SPEED_OF_SOUND) {
    throw new Error('Source speed must be less than the speed of sound');
  }
  const ratio = SPEED_OF_SOUND / (SPEED_OF_SOUND - sourceSpeedMs);
  return parseFloat(ratio.toFixed(4));
}

/**
 * Convert Doppler ratio to pitch shift in semitones.
 * @param {number} ratio - Frequency ratio from calcDopplerRatio
 * @returns {number} Semitones (positive = pitch up)
 */
function dopplerRatioToSemitones(ratio) {
  if (ratio <= 0) throw new Error('Ratio must be > 0');
  return parseFloat((12 * Math.log2(ratio)).toFixed(3));
}

// ─────────────────────────────────────────────────────────────
// B-FORMAT AMBISONICS (1st order W/X/Y/Z coefficients)
// ─────────────────────────────────────────────────────────────

/**
 * Calculate B-Format (1st-order Ambisonics) encoding coefficients.
 * W = omnidirectional (0.707), X = front-back, Y = left-right, Z = up-down.
 *
 * @param {number} azimuthDeg   - Azimuth in degrees (-180 to +180, 0 = front)
 * @param {number} elevationDeg - Elevation in degrees (-90 to +90, 0 = horizontal)
 * @returns {{ W: number, X: number, Y: number, Z: number }}
 */
function calcBFormat(azimuthDeg, elevationDeg) {
  const az = toRad(azimuthDeg);
  const el = toRad(elevationDeg);
  return {
    W: parseFloat((Math.SQRT1_2).toFixed(4)),         // 1/√2 ≈ 0.7071
    X: parseFloat((Math.cos(az) * Math.cos(el)).toFixed(4)),
    Y: parseFloat((Math.sin(az) * Math.cos(el)).toFixed(4)),
    Z: parseFloat((Math.sin(el)).toFixed(4))
  };
}

/**
 * Validate B-Format energy conservation: W² + X² + Y² + Z² should equal ~1.
 * @param {{ W: number, X: number, Y: number, Z: number }} bfmt
 * @param {number} tolerance - Allowed deviation (default 0.01)
 * @returns {boolean}
 */
function validateBFormatEnergy(bfmt, tolerance = 0.01) {
  const energy = bfmt.W ** 2 + bfmt.X ** 2 + bfmt.Y ** 2 + bfmt.Z ** 2;
  // Expected: W² = 0.5, X²+Y²+Z² = cos²(el) * 1 + sin²(el) = 1 → total = 1.5
  // (Standard B-Format energy = 1.5 for a single source)
  return Math.abs(energy - 1.5) < tolerance;
}

// ─────────────────────────────────────────────────────────────
// AMBISONIC ORDER INFO
// ─────────────────────────────────────────────────────────────

/**
 * Get Ambisonics metadata for a given order.
 * @param {number} order - 0, 1, 2, or 3
 * @returns {{ order: number, label: string, channels: number, tag: string }}
 */
function getAmbisonicOrder(order) {
  const a = AMBISONIC_ORDERS.find(x => x.order === order);
  if (!a) throw new Error(`Invalid Ambisonics order: ${order}. Must be 0–3.`);
  return a;
}

/**
 * Number of channels for a given Ambisonics order.
 * Formula: (order + 1)²
 * @param {number} order
 * @returns {number}
 */
function ambisonicChannelCount(order) {
  if (order < 0 || order > 3) throw new Error('Order must be 0–3');
  return (order + 1) ** 2;
}

// ─────────────────────────────────────────────────────────────
// FULL SPATIAL PARAMETER BUNDLE
// ─────────────────────────────────────────────────────────────

/**
 * Calculate all spatial audio parameters for a given source position.
 *
 * @param {object} params
 * @param {number} params.azimuthDeg   - Azimuth angle (-180 to +180)
 * @param {number} params.elevationDeg - Elevation angle (-90 to +90)
 * @param {number} params.distanceM    - Distance in metres (> 0)
 * @param {number} params.sourceSpeedMs - Source velocity in m/s (0 = static)
 * @returns {{
 *   ild: number, itd: number, airAbsorption: number,
 *   dopplerRatio: number, dopplerSemitones: number,
 *   bFormat: { W: number, X: number, Y: number, Z: number }
 * }}
 */
function calcSpatialBundle(params) {
  const { azimuthDeg, elevationDeg, distanceM, sourceSpeedMs = 0 } = params;

  if (distanceM <= 0)               throw new Error('distanceM must be > 0');
  if (azimuthDeg < -180 || azimuthDeg > 180)
    throw new Error('azimuthDeg must be between -180 and 180');
  if (elevationDeg < -90 || elevationDeg > 90)
    throw new Error('elevationDeg must be between -90 and 90');
  if (sourceSpeedMs >= SPEED_OF_SOUND)
    throw new Error('sourceSpeedMs must be < speed of sound (343 m/s)');

  const ild           = calcILD(azimuthDeg);
  const itd           = calcITD(azimuthDeg);
  const airAbsorption = calcAirAbsorption(distanceM);
  const dopplerRatio  = calcDopplerRatio(sourceSpeedMs);
  const dopplerSemitones = dopplerRatioToSemitones(dopplerRatio);
  const bFormat       = calcBFormat(azimuthDeg, elevationDeg);

  return { ild, itd, airAbsorption, dopplerRatio, dopplerSemitones, bFormat };
}

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

module.exports = {
  SPEED_OF_SOUND,
  HEAD_RADIUS,
  AIR_ABS_COEFF,
  AMBISONIC_ORDERS,
  toRad,
  toDeg,
  calcILD,
  calcITD,
  maxITD,
  calcAirAbsorption,
  calcDopplerRatio,
  dopplerRatioToSemitones,
  calcBFormat,
  validateBFormatEnergy,
  getAmbisonicOrder,
  ambisonicChannelCount,
  calcSpatialBundle
};

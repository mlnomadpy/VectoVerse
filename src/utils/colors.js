/**
 * Interpolates between two colors.
 * @param {string} color1 - The start color (hex).
 * @param {string} color2 - The end color (hex).
 * @param {number} factor - The interpolation factor (0 to 1).
 * @returns {string} The interpolated hex color.
 */
function interpolateColor(color1, color2, factor) {
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);

  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);

  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Generates a heatmap color for a value within a given range.
 * @param {number} value - The value to get a color for.
 * @param {number} min - The minimum value in the range.
 * @param {number} max - The maximum value in the range.
 * @returns {string} The calculated hex color.
 */
export function getHeatmapColor(value, min, max) {
  if (min === max) {
    return '#667eea'; // Return a neutral color if all values are the same
  }
  const factor = (value - min) / (max - min);
  // Interpolate from a cool blue to a hot red
  return interpolateColor('#4ecdc4', '#ff6b6b', factor);
} 
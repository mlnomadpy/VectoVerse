const prefixes = [
  // 1-10
  'Mono', 'Di', 'Tri', 'Tetra', 'Penta', 'Hexa', 'Hepta', 'Octa', 'Nona', 'Deca',
  // 11-20
  'Undeca', 'Dodeca', 'Trideca', 'Tetradeca', 'Pentadeca', 'Hexadeca', 'Heptadeca', 'Octadeca', 'Nonadeca', 'Icosa'
];

const excitatoryRoots = ['volta', 'pyra', 'radia', 'fluxa', 'activa'];
const inhibitoryRoots = ['staso', 'cryo', 'umbra', 'voida', 'quella'];
const balancedRoots = ['equila', 'neutra', 'zena', 'axia', 'paxa'];

/**
 * Generates a procedural name for a vector element based on its quantum properties.
 * @param {number} excitatory - The number of excitatory components.
 * @param {number} inhibitory - The number of inhibitory components.
 * @returns {string} The generated element name.
 */
export function generateElementName(excitatory, inhibitory) {
  const activeDimensions = excitatory + inhibitory;

  if (activeDimensions === 0) {
    return 'Amorphium'; // Changed from Neutronium for consistency
  }

  // Get prefix, fallback to 'Poly' for dimensions > 20
  const prefix = prefixes[activeDimensions - 1] || 'Poly';
  let root;

  if (excitatory > inhibitory) {
    root = excitatoryRoots[excitatory % excitatoryRoots.length];
  } else if (inhibitory > excitatory) {
    root = inhibitoryRoots[inhibitory % inhibitoryRoots.length];
  } else { // balanced
    root = balancedRoots[(excitatory + inhibitory) % balancedRoots.length];
  }
  
  const name = prefix + root;
  return name.charAt(0).toUpperCase() + name.slice(1);
} 
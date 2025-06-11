const prefixes = [
    // 1-10
    'Mono', 'Di', 'Tri', 'Tetra', 'Penta', 'Hexa', 'Hepta', 'Octa', 'Nona', 'Deca',
    // 11-20
    'Undeca', 'Dodeca', 'Trideca', 'Tetradeca', 'Pentadeca', 'Hexadeca', 'Heptadeca', 'Octadeca', 'Nonadeca', 'Icosa'
  ];
  
  // 🔥 Excitatory roots (Energy, Fire, Force)
  const excitatoryRoots = [
    'Aether',       // Greek: divine spark
    'Agni',         // Sanskrit: fire deity
    'Raijin',       // Japanese: thunder god
    'Shango',       // Yoruba: lightning/fire deity
    'Surtr',        // Norse: fire giant
    'Sekhem',       // Egyptian: power/life force
    'Itztli',       // Aztec: obsidian, energy blade
    'Pele',         // Hawaiian: volcano goddess
    'Huitzilopochtli', // Aztec: sun/war god
    'Brigid',       // Celtic: fire and fertility
    'Hephaestus',   // Greek: god of forge
    'Amaterasu'     // Japanese: sun goddess
  ];
  
  // ❄️ Inhibitory roots (Darkness, Cold, Void)
  const inhibitoryRoots = [
    'Frigus',       // Latin: cold
    'Tamasa',       // Sanskrit: inertia/darkness
    'Yami',         // Japanese: darkness
    'Nu',           // Egyptian: primordial void
    'Morana',       // Slavic: goddess of winter/death
    'Tenebris',     // Latin: shadow
    'Noctis',       // Latin: night
    'Chione',       // Greek: goddess of snow
    'Izanami',      // Japanese: goddess of death
    'Hel',          // Norse: underworld deity
    'Kali',         // Sanskrit: destruction, time
    'Ereshkigal'    // Sumerian: queen of the underworld
  ];
  
  // ⚖️ Balanced roots (Harmony, Equilibrium, Law)
  const balancedRoots = [
    'Zhong',        // Chinese: center/balance
    'Sattva',       // Sanskrit: harmony/purity
    'Sophrosyne',   // Greek: moderation
    'Nkwa',         // Akan: life force
    'Wa',           // Japanese: peace/harmony
    'Dharma',       // Sanskrit: cosmic law
    'Ma\'at',       // Egyptian: balance, truth
    'Asha',         // Persian (Zoroastrian): truth/order
    'Rta',          // Vedic: natural law
    'Tao',          // Chinese: the way
    'Heka',         // Egyptian: magical order
    'Ubuntu'        // Bantu: harmony through humanity
  ];
  
  /**
   * Generates a procedural name for a vector element based on its quantum properties.
   * @param {number} excitatory - The number of excitatory components.
   * @param {number} inhibitory - The number of inhibitory components.
   * @returns {string} The generated element name.
   */
  export function generateElementName(excitatory, inhibitory) {
    const activeDimensions = excitatory + inhibitory;
  
    if (activeDimensions === 0) {
      return 'Amorphium'; // A neutral placeholder for zero-dimensional elements
    }
  
    // Get the numeric prefix, default to "Poly" for high-dimensional vectors
    const prefix = prefixes[activeDimensions - 1] || 'Poly';
  
    let root;
  
    if (excitatory > inhibitory) {
      root = excitatoryRoots[excitatory % excitatoryRoots.length];
    } else if (inhibitory > excitatory) {
      root = inhibitoryRoots[inhibitory % inhibitoryRoots.length];
    } else {
      // Balanced case
      root = balancedRoots[(excitatory + inhibitory) % balancedRoots.length];
    }
  
    // Combine and capitalize
    const name = prefix + root;
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  
import { ref, onMounted } from 'vue'

export function useMathRenderer() {
  const isKaTeXReady = ref(false)

  const waitForKaTeX = () => {
    if (typeof window.katex !== 'undefined' && typeof window.renderMathInElement !== 'undefined') {
      isKaTeXReady.value = true
    } else {
      setTimeout(waitForKaTeX, 100)
    }
  }

  onMounted(waitForKaTeX)

  const renderMath = (element, options = {}) => {
    if (!isKaTeXReady.value || !element) return

    const defaultOptions = {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true }
      ],
      throwOnError: false,
      errorColor: '#cc0000',
      macros: {
        "\\vec": "\\mathbf{#1}",
        "\\norm": "\\left\\|#1\\right\\|",
        "\\dot": "\\cdot",
        "\\similarity": "\\text{sim}(#1, #2)",
        "\\cosinesim": "\\cos\\theta_{#1,#2}"
      }
    }

    try {
      window.renderMathInElement(element, { ...defaultOptions, ...options })
    } catch (e) {
      console.warn('KaTeX rendering error:', e)
    }
  }

  const createVectorNotation = (components) => {
    if (!Array.isArray(components)) return ''
    // Limit to 10 components for display
    const limitedComponents = components.slice(0, 10);
    let componentStr = limitedComponents.map(c => c.toFixed(2)).join(' \\\\ ');
    if (components.length > 10) {
        componentStr += ' \\\\ \\vdots';
    }
    return `\\vec{v} = \\begin{pmatrix} ${componentStr} \\end{pmatrix}`;
  }

  const createMagnitudeFormula = (val) => `\\norm{\\vec{v}} = ${val.toFixed(3)}`
  const createEntropyFormula = (val) => `H(\\vec{v}) = ${val.toFixed(3)}`
  const createCosineSimilarityFormula = () => `\\text{sim}(\\vec{a}, \\vec{b}) = \\frac{\\vec{a} \\cdot \\vec{b}}{\\norm{\\vec{a}} \\norm{\\vec{b}}}`
  const createEuclideanDistanceFormula = () => `d(\\vec{a}, \\vec{b}) = \\sqrt{\\sum_{i=1}^{n} (a_i - b_i)^2}`

  return {
    isKaTeXReady,
    renderMath,
    createVectorNotation,
    createMagnitudeFormula,
    createEntropyFormula,
    createCosineSimilarityFormula,
    createEuclideanDistanceFormula,
  }
} 
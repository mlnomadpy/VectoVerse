import { ref, computed } from 'vue'
import { useVectorStore } from '../stores/vectorStore'
import { useUIStore } from '../stores/uiStore'

export function useExportManager() {
  const vectorStore = useVectorStore()
  const uiStore = useUIStore()
  
  // State
  const isExporting = ref(false)
  const exportProgress = ref(0)

  // Export formats
  const formats = ref({
    json: { name: 'JSON', extension: '.json', mimeType: 'application/json' },
    csv: { name: 'CSV', extension: '.csv', mimeType: 'text/csv' },
    svg: { name: 'SVG', extension: '.svg', mimeType: 'image/svg+xml' },
    png: { name: 'PNG', extension: '.png', mimeType: 'image/png' },
    latex: { name: 'LaTeX', extension: '.tex', mimeType: 'text/plain' },
    python: { name: 'Python', extension: '.py', mimeType: 'text/plain' },
    txt: { name: 'Text Report', extension: '.txt', mimeType: 'text/plain' }
  })

  // Computed properties
  const hasVectors = computed(() => vectorStore.vectors.length > 0)
  const canExport = computed(() => hasVectors.value && !isExporting.value)

  // Export JSON with metadata
  const exportJSON = async () => {
    if (!canExport.value) return

    isExporting.value = true
    exportProgress.value = 10

    try {
      const exportData = {
        metadata: {
          version: "2.0",
          timestamp: new Date().toISOString(),
          source: "VectoVerse",
          description: "Vector visualization data export"
        },
        config: {
          dimensions: vectorStore.vectors[0]?.components.length || 0,
          numVectors: vectorStore.vectors.length
        },
        vectors: vectorStore.vectors.map(v => ({
          id: v.id,
          components: v.components,
          position: { x: v.x || 0, y: v.y || 0 },
          type: v.type || 'generated',
          metadata: {
            magnitude: calculateMagnitude(v.components),
            entropy: calculateEntropy(v.components)
          }
        })),
        inputVector: vectorStore.inputVector ? {
          components: vectorStore.inputVector.components,
          position: { x: vectorStore.inputVector.x || 0, y: vectorStore.inputVector.y || 0 }
        } : null,
        analysis: generateAnalysisData()
      }

      exportProgress.value = 80
      
      downloadFile(
        JSON.stringify(exportData, null, 2),
        `vectoverse-export-${getTimestamp()}.json`,
        'application/json'
      )

      uiStore.showSuccess('JSON export completed successfully!')
    } catch (error) {
      uiStore.showError(`JSON export failed: ${error.message}`)
    } finally {
      isExporting.value = false
      exportProgress.value = 0
    }
  }

  // Export CSV format
  const exportCSV = async () => {
    if (!canExport.value) return

    isExporting.value = true
    exportProgress.value = 10

    try {
      const vectors = vectorStore.vectors
      if (vectors.length === 0) {
        throw new Error('No vectors to export')
      }
      
      const dimensions = vectors[0].components.length
      
      // Create headers
      const headers = [
        'vector_id', 'type', 'x_position', 'y_position', 
        'magnitude', 'entropy'
      ]
      
      // Add dimension headers
      for (let i = 0; i < dimensions; i++) {
        headers.push(`component_${i + 1}`)
      }
      
      exportProgress.value = 30
      
      // Create rows
      const rows = [headers.join(',')]
      
      vectors.forEach(vector => {
        const row = [
          vector.id,
          vector.type || 'generated',
          (vector.x || 0).toFixed(2),
          (vector.y || 0).toFixed(2),
          calculateMagnitude(vector.components).toFixed(6),
          calculateEntropy(vector.components).toFixed(6),
          ...vector.components.map(c => c.toFixed(6))
        ]
        rows.push(row.join(','))
      })
      
      // Add input vector if exists
      if (vectorStore.inputVector) {
        const inputRow = [
          'input',
          'input',
          (vectorStore.inputVector.x || 0).toFixed(2),
          (vectorStore.inputVector.y || 0).toFixed(2),
          calculateMagnitude(vectorStore.inputVector.components).toFixed(6),
          calculateEntropy(vectorStore.inputVector.components).toFixed(6),
          ...vectorStore.inputVector.components.map(c => c.toFixed(6))
        ]
        rows.push(inputRow.join(','))
      }
      
      exportProgress.value = 80
      
      downloadFile(
        rows.join('\n'),
        `vectoverse-data-${getTimestamp()}.csv`,
        'text/csv'
      )

      uiStore.showSuccess('CSV export completed successfully!')
    } catch (error) {
      uiStore.showError(`CSV export failed: ${error.message}`)
    } finally {
      isExporting.value = false
      exportProgress.value = 0
    }
  }

  // Export similarity matrix as CSV
  const exportSimilarityMatrix = async () => {
    if (!canExport.value) return

    isExporting.value = true
    exportProgress.value = 10

    try {
      const vectors = vectorStore.vectors
      if (vectors.length === 0) return

      // Create header with vector IDs
      const headers = ['vector_id', ...vectors.map(v => v.id)]
      const rows = [headers.join(',')]
      
      exportProgress.value = 30
      
      // Calculate similarity matrix
      vectors.forEach((v1, i) => {
        const row = [v1.id]
        vectors.forEach(v2 => {
          const similarity = cosineSimilarity(v1.components, v2.components)
          row.push(similarity.toFixed(4))
        })
        rows.push(row.join(','))
        exportProgress.value = 30 + (i / vectors.length) * 50
      })
      
      downloadFile(
        rows.join('\n'),
        `vectoverse-similarity-matrix-${getTimestamp()}.csv`,
        'text/csv'
      )

      uiStore.showSuccess('Similarity matrix exported successfully!')
    } catch (error) {
      uiStore.showError(`Similarity matrix export failed: ${error.message}`)
    } finally {
      isExporting.value = false
      exportProgress.value = 0
    }
  }

  // Export as SVG
  const exportSVG = async () => {
    if (!canExport.value) return

    isExporting.value = true
    exportProgress.value = 10

    try {
      const svg = document.querySelector('#main-viz')
      if (!svg) {
        throw new Error('No visualization found to export')
      }
      
      exportProgress.value = 30
      
      // Clone the SVG to avoid modifying the original
      const clonedSvg = svg.cloneNode(true)
      
      // Add styles inline for standalone SVG
      const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style')
      styleElement.textContent = getSVGStyles()
      clonedSvg.insertBefore(styleElement, clonedSvg.firstChild)
      
      exportProgress.value = 70
      
      // Serialize SVG
      const serializer = new XMLSerializer()
      const svgString = serializer.serializeToString(clonedSvg)
      
      downloadFile(
        svgString,
        `vectoverse-visualization-${getTimestamp()}.svg`,
        'image/svg+xml'
      )

      uiStore.showSuccess('SVG export completed successfully!')
    } catch (error) {
      uiStore.showError(`SVG export failed: ${error.message}`)
    } finally {
      isExporting.value = false
      exportProgress.value = 0
    }
  }

  // Export as PNG
  const exportPNG = async (scale = 2) => {
    if (!canExport.value) return

    isExporting.value = true
    exportProgress.value = 10

    try {
      const svg = document.querySelector('#main-viz')
      if (!svg) {
        throw new Error('No visualization found to export')
      }
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const rect = svg.getBoundingClientRect()
      
      canvas.width = rect.width * scale
      canvas.height = rect.height * scale
      
      exportProgress.value = 30
      
      // Create image from SVG
      const svgData = new XMLSerializer().serializeToString(svg)
      const img = new Image()
      
      const promise = new Promise((resolve, reject) => {
        img.onload = () => {
          ctx.scale(scale, scale)
          ctx.drawImage(img, 0, 0)
          
          exportProgress.value = 80
          
          canvas.toBlob(blob => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `vectoverse-visualization-${getTimestamp()}.png`
              a.click()
              URL.revokeObjectURL(url)
              resolve()
            } else {
              reject(new Error('Failed to create PNG blob'))
            }
          })
        }
        
        img.onerror = () => reject(new Error('Failed to load SVG for PNG export'))
      })
      
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(svgBlob)
      img.src = url
      
      await promise
      URL.revokeObjectURL(url)

      uiStore.showSuccess('PNG export completed successfully!')
    } catch (error) {
      uiStore.showError(`PNG export failed: ${error.message}`)
    } finally {
      isExporting.value = false
      exportProgress.value = 0
    }
  }

  // Export as LaTeX document
  const exportLaTeX = async () => {
    if (!canExport.value) return

    isExporting.value = true
    exportProgress.value = 10

    try {
      const vectors = vectorStore.vectors
      const analysis = generateAnalysisData()
      
      exportProgress.value = 30
      
      const latex = `
\\documentclass{article}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{booktabs}
\\usepackage{geometry}
\\geometry{margin=1in}

\\title{VectoVerse Vector Analysis Report}
\\author{Generated by VectoVerse}
\\date{${new Date().toLocaleDateString()}}

\\begin{document}
\\maketitle

\\section{Dataset Overview}
This report contains analysis of ${vectors.length} vectors in ${vectors[0]?.components.length || 0}-dimensional space.

\\section{Vector Statistics}
\\begin{table}[h]
\\centering
\\begin{tabular}{lr}
\\toprule
Metric & Value \\\\
\\midrule
Number of Vectors & ${vectors.length} \\\\
Dimensions & ${vectors[0]?.components.length || 0} \\\\
Average Magnitude & ${analysis.averageMagnitude.toFixed(4)} \\\\
Average Entropy & ${analysis.averageEntropy.toFixed(4)} \\\\
\\bottomrule
\\end{tabular}
\\caption{Basic vector statistics}
\\end{table}

\\section{Mathematical Formulations}
The following formulas were used in the analysis:

\\subsection{Vector Magnitude}
\\begin{equation}
||\\mathbf{v}|| = \\sqrt{\\sum_{i=1}^{n} v_i^2}
\\end{equation}

\\subsection{Cosine Similarity}
\\begin{equation}
\\text{sim}(\\mathbf{u}, \\mathbf{v}) = \\frac{\\mathbf{u} \\cdot \\mathbf{v}}{||\\mathbf{u}|| \\cdot ||\\mathbf{v}||}
\\end{equation}

\\subsection{Information Entropy}
\\begin{equation}
H(\\mathbf{v}) = -\\sum_{i=1}^{n} p(v_i) \\log_2(p(v_i))
\\end{equation}

\\section{Vector Components}
${generateLaTeXVectorTable(vectors.slice(0, 10))}

\\end{document}
      `.trim()
      
      exportProgress.value = 80
      
      downloadFile(
        latex,
        `vectoverse-analysis-${getTimestamp()}.tex`,
        'text/plain'
      )

      uiStore.showSuccess('LaTeX export completed successfully!')
    } catch (error) {
      uiStore.showError(`LaTeX export failed: ${error.message}`)
    } finally {
      isExporting.value = false
      exportProgress.value = 0
    }
  }

  // Export as Python NumPy script
  const exportPython = async () => {
    if (!canExport.value) return

    isExporting.value = true
    exportProgress.value = 10

    try {
      const vectors = vectorStore.vectors
      if (vectors.length === 0) return
      
      exportProgress.value = 30
      
      const pythonCode = `
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime

# VectoVerse Export
# Generated on: ${new Date().toISOString()}

# Vector data
vectors = np.array([
${vectors.map(v => `    [${v.components.map(c => c.toFixed(6)).join(', ')}]`).join(',\n')}
])

# Vector metadata
vector_ids = [${vectors.map(v => `'${v.id}'`).join(', ')}]
positions = np.array([
${vectors.map(v => `    [${(v.x || 0).toFixed(2)}, ${(v.y || 0).toFixed(2)}]`).join(',\n')}
])

${vectorStore.inputVector ? `
# Input vector
input_vector = np.array([${vectorStore.inputVector.components.map(c => c.toFixed(6)).join(', ')}])
input_position = np.array([${(vectorStore.inputVector.x || 0).toFixed(2)}, ${(vectorStore.inputVector.y || 0).toFixed(2)}])
` : '# No input vector'}

# Basic analysis functions
def calculate_magnitude(v):
    return np.linalg.norm(v)

def cosine_similarity(v1, v2):
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

def euclidean_distance(v1, v2):
    return np.linalg.norm(v1 - v2)

# Calculate similarity matrix
similarity_matrix = np.zeros((len(vectors), len(vectors)))
for i in range(len(vectors)):
    for j in range(len(vectors)):
        similarity_matrix[i, j] = cosine_similarity(vectors[i], vectors[j])

print(f"Loaded {len(vectors)} vectors with {vectors.shape[1]} dimensions")
print(f"Average magnitude: {np.mean([calculate_magnitude(v) for v in vectors]):.4f}")

# Example visualization
plt.figure(figsize=(10, 8))
plt.imshow(similarity_matrix, cmap='viridis')
plt.colorbar(label='Cosine Similarity')
plt.title('Vector Similarity Matrix')
plt.xlabel('Vector Index')
plt.ylabel('Vector Index')
plt.show()
      `.trim()
      
      exportProgress.value = 80
      
      downloadFile(
        pythonCode,
        `vectoverse-export-${getTimestamp()}.py`,
        'text/plain'
      )

      uiStore.showSuccess('Python export completed successfully!')
    } catch (error) {
      uiStore.showError(`Python export failed: ${error.message}`)
    } finally {
      isExporting.value = false
      exportProgress.value = 0
    }
  }

  // Export session data
  const exportSession = async () => {
    if (!canExport.value) return

    isExporting.value = true
    exportProgress.value = 10

    try {
      const sessionData = {
        metadata: {
          version: "2.0",
          timestamp: new Date().toISOString(),
          source: "VectoVerse Session Export"
        },
        config: {
          dimensions: vectorStore.vectors[0]?.components.length || 0,
          numVectors: vectorStore.vectors.length,
          theme: localStorage.getItem('vectoverse-theme') || 'dark'
        },
        vectors: vectorStore.vectors.map(v => ({
          id: v.id,
          components: v.components,
          position: { x: v.x || 0, y: v.y || 0 },
          type: v.type || 'generated',
          customColor: v.customColor,
          scale: v.scale
        })),
        inputVector: vectorStore.inputVector ? {
          components: vectorStore.inputVector.components,
          position: { x: vectorStore.inputVector.x || 0, y: vectorStore.inputVector.y || 0 }
        } : null,
        selectedVectorId: vectorStore.selectedVectorId
      }

      exportProgress.value = 80
      
      downloadFile(
        JSON.stringify(sessionData, null, 2),
        `vectoverse-session-${getTimestamp()}.json`,
        'application/json'
      )

      uiStore.showSuccess('Session export completed successfully!')
    } catch (error) {
      uiStore.showError(`Session export failed: ${error.message}`)
    } finally {
      isExporting.value = false
      exportProgress.value = 0
    }
  }

  // Helper functions
  const calculateMagnitude = (components) => {
    return Math.sqrt(components.reduce((sum, c) => sum + c * c, 0))
  }

  const calculateEntropy = (components) => {
    const total = components.reduce((sum, c) => sum + Math.abs(c), 0)
    if (total === 0) return 0
    
    const probabilities = components.map(c => Math.abs(c) / total)
    return -probabilities.reduce((sum, p) => {
      return p > 0 ? sum + p * Math.log2(p) : sum
    }, 0)
  }

  const cosineSimilarity = (v1, v2) => {
    const dotProduct = v1.reduce((sum, a, i) => sum + a * v2[i], 0)
    const mag1 = calculateMagnitude(v1)
    const mag2 = calculateMagnitude(v2)
    
    if (mag1 === 0 || mag2 === 0) return 0
    return dotProduct / (mag1 * mag2)
  }

  const generateAnalysisData = () => {
    const vectors = vectorStore.vectors
    
    if (vectors.length === 0) {
      return {
        averageMagnitude: 0,
        averageEntropy: 0,
        vectorCount: 0,
        dimensions: 0
      }
    }
    
    const magnitudes = vectors.map(v => calculateMagnitude(v.components))
    const entropies = vectors.map(v => calculateEntropy(v.components))
    
    return {
      vectorCount: vectors.length,
      dimensions: vectors[0].components.length,
      averageMagnitude: magnitudes.reduce((sum, mag) => sum + mag, 0) / magnitudes.length,
      averageEntropy: entropies.reduce((sum, ent) => sum + ent, 0) / entropies.length,
      magnitudes: magnitudes,
      entropies: entropies
    }
  }

  const generateLaTeXVectorTable = (vectors) => {
    if (vectors.length === 0) return ''
    
    const maxComponents = Math.min(5, vectors[0].components.length)
    
    let table = '\\begin{table}[h]\n\\centering\n\\begin{tabular}{l'
    for (let i = 0; i < maxComponents; i++) {
      table += 'r'
    }
    table += '}\n\\toprule\nVector'
    
    for (let i = 0; i < maxComponents; i++) {
      table += ` & $v_{${i+1}}$`
    }
    table += ' \\\\\n\\midrule\n'
    
    vectors.forEach((vector, idx) => {
      table += `Vector ${idx + 1}`
      for (let i = 0; i < maxComponents; i++) {
        table += ` & ${vector.components[i].toFixed(3)}`
      }
      table += ' \\\\\n'
    })
    
    table += '\\bottomrule\n\\end{tabular}\n\\caption{Vector components (first 5 dimensions)}\n\\end{table}'
    
    return table
  }

  const getSVGStyles = () => {
    return `
      .vector-atom { stroke: #667eea; stroke-width: 2; fill-opacity: 0.8; }
      .force-line { stroke-opacity: 0.6; }
      .vector-label { font-family: Arial, sans-serif; font-size: 12px; fill: white; }
      .periodic-element { cursor: pointer; }
      .periodic-element:hover { filter: brightness(1.2); }
    `
  }

  const getTimestamp = () => {
    return new Date().toISOString().slice(0, 19).replace(/[:]/g, '-')
  }

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return {
    // State
    isExporting,
    exportProgress,
    formats,
    
    // Computed
    hasVectors,
    canExport,
    
    // Methods
    exportJSON,
    exportCSV,
    exportSimilarityMatrix,
    exportSVG,
    exportPNG,
    exportLaTeX,
    exportPython,
    exportSession,
    
    // Helper methods
    calculateMagnitude,
    calculateEntropy,
    cosineSimilarity,
    generateAnalysisData,
    downloadFile
  }
} 
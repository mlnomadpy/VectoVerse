// Enhanced Export Manager for VectoVerse
export class ExportManager {
    constructor(framework) {
        this.framework = framework;
    }

    /**
     * Export data in JSON format with metadata
     */
    exportJSON() {
        const state = this.framework.getState();
        const config = this.framework.getConfig();
        
        const exportData = {
            metadata: {
                version: "1.0",
                timestamp: new Date().toISOString(),
                source: "VectoVerse",
                description: "Vector visualization data export"
            },
            config: {
                dimensions: config.dimensions,
                numVectors: config.numVectors,
                showForces: config.showForces
            },
            vectors: state.vectors.map(v => ({
                id: v.id,
                components: v.components,
                position: { x: v.x, y: v.y },
                metadata: {
                    magnitude: this.framework.calculateMagnitude(v.components),
                    entropy: this.framework.calculateEntropy(v.components)
                }
            })),
            inputVector: state.inputVector ? {
                components: state.inputVector.components,
                position: { x: state.inputVector.x, y: state.inputVector.y }
            } : null,
            analysis: this.generateAnalysisData()
        };

        this.downloadFile(
            JSON.stringify(exportData, null, 2),
            'vectoverse-export.json',
            'application/json'
        );
    }

    /**
     * Export as CSV format
     */
    exportCSV() {
        const state = this.framework.getState();
        const vectors = state.vectors;
        
        if (vectors.length === 0) return;
        
        const dimensions = vectors[0].components.length;
        
        // Create header
        const headers = ['id', 'x', 'y', 'magnitude', 'entropy'];
        for (let i = 0; i < dimensions; i++) {
            headers.push(`dim_${i}`);
        }
        
        // Create rows
        const rows = [headers.join(',')];
        
        vectors.forEach(vector => {
            const row = [
                vector.id,
                vector.x.toFixed(2),
                vector.y.toFixed(2),
                this.framework.calculateMagnitude(vector.components).toFixed(4),
                this.framework.calculateEntropy(vector.components).toFixed(4),
                ...vector.components.map(c => c.toFixed(4))
            ];
            rows.push(row.join(','));
        });
        
        // Add input vector if exists
        if (state.inputVector) {
            const inputRow = [
                'input',
                state.inputVector.x.toFixed(2),
                state.inputVector.y.toFixed(2),
                this.framework.calculateMagnitude(state.inputVector.components).toFixed(4),
                this.framework.calculateEntropy(state.inputVector.components).toFixed(4),
                ...state.inputVector.components.map(c => c.toFixed(4))
            ];
            rows.push(inputRow.join(','));
        }
        
        this.downloadFile(
            rows.join('\n'),
            'vectoverse-vectors.csv',
            'text/csv'
        );
    }

    /**
     * Export similarity matrix as CSV
     */
    exportSimilarityMatrix() {
        const state = this.framework.getState();
        const vectors = state.vectors;
        const forceCalculator = this.framework.getModules().forceCalculator;
        
        if (vectors.length === 0) return;
        
        // Create header with vector IDs
        const headers = ['vector_id', ...vectors.map(v => v.id)];
        const rows = [headers.join(',')];
        
        // Calculate similarity matrix
        vectors.forEach(v1 => {
            const row = [v1.id];
            vectors.forEach(v2 => {
                const similarity = forceCalculator.cosineSimilarity(v1.components, v2.components);
                row.push(similarity.toFixed(4));
            });
            rows.push(row.join(','));
        });
        
        this.downloadFile(
            rows.join('\n'),
            'vectoverse-similarity-matrix.csv',
            'text/csv'
        );
    }

    /**
     * Export as SVG for high-quality vector graphics
     */
    exportSVG() {
        const svg = document.querySelector('#main-viz');
        if (!svg) return;
        
        // Clone the SVG to avoid modifying the original
        const clonedSvg = svg.cloneNode(true);
        
        // Add styles inline for standalone SVG
        const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        styleElement.textContent = this.getSVGStyles();
        clonedSvg.insertBefore(styleElement, clonedSvg.firstChild);
        
        // Serialize SVG
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(clonedSvg);
        
        this.downloadFile(
            svgString,
            'vectoverse-visualization.svg',
            'image/svg+xml'
        );
    }

    /**
     * Export as high-resolution PNG
     */
    exportPNG(scale = 2) {
        const svg = document.querySelector('#main-viz');
        if (!svg) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const config = this.framework.getConfig();
        
        canvas.width = config.width * scale;
        canvas.height = config.height * scale;
        
        // Create image from SVG
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        
        img.onload = () => {
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'vectoverse-visualization.png';
                a.click();
                URL.revokeObjectURL(url);
            });
        };
        
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        img.src = url;
    }

    /**
     * Export mathematical analysis as LaTeX
     */
    exportLaTeX() {
        const state = this.framework.getState();
        const analysis = this.generateAnalysisData();
        
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
This report contains analysis of ${state.vectors.length} vectors in ${state.vectors[0]?.components.length || 0}-dimensional space.

\\section{Vector Statistics}
\\begin{table}[h]
\\centering
\\begin{tabular}{lr}
\\toprule
Metric & Value \\\\
\\midrule
Number of Vectors & ${state.vectors.length} \\\\
Dimensions & ${state.vectors[0]?.components.length || 0} \\\\
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

\\subsection{Resonance Force}
\\begin{equation}
R(\\mathbf{u}, \\mathbf{v}) = \\frac{(\\mathbf{u} \\cdot \\mathbf{v})^2}{||\\mathbf{u} - \\mathbf{v}||^2 + \\epsilon}
\\end{equation}

\\section{Vector Components}
${this.generateLaTeXVectorTable(state.vectors.slice(0, 10))}

\\end{document}
        `.trim();
        
        this.downloadFile(
            latex,
            'vectoverse-analysis.tex',
            'text/plain'
        );
    }

    /**
     * Export as Python NumPy format
     */
    exportNumPy() {
        const state = this.framework.getState();
        const vectors = state.vectors;
        
        if (vectors.length === 0) return;
        
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
${vectors.map(v => `    [${v.x.toFixed(2)}, ${v.y.toFixed(2)}]`).join(',\n')}
])

${state.inputVector ? `
# Input vector
input_vector = np.array([${state.inputVector.components.map(c => c.toFixed(6)).join(', ')}])
input_position = np.array([${state.inputVector.x.toFixed(2)}, ${state.inputVector.y.toFixed(2)}])
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
        `.trim();
        
        this.downloadFile(
            pythonCode,
            'vectoverse-export.py',
            'text/plain'
        );
    }

    /**
     * Export interactive HTML report
     */
    exportHTMLReport() {
        const state = this.framework.getState();
        const analysis = this.generateAnalysisData();
        
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>VectoVerse Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 2px solid #4ecdc4; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; color: #4ecdc4; }
        .stat-label { color: #666; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; }
        .vector-component { font-family: monospace; }
        .export-info { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌌 VectoVerse Analysis Report</h1>
        
        <div class="export-info">
            <strong>Generated:</strong> ${new Date().toLocaleString()}<br>
            <strong>Source:</strong> VectoVerse Interactive Vector Visualization
        </div>

        <h2>📊 Dataset Overview</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${state.vectors.length}</div>
                <div class="stat-label">Vectors</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${state.vectors[0]?.components.length || 0}</div>
                <div class="stat-label">Dimensions</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${analysis.averageMagnitude.toFixed(3)}</div>
                <div class="stat-label">Avg Magnitude</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${analysis.averageEntropy.toFixed(3)}</div>
                <div class="stat-label">Avg Entropy</div>
            </div>
        </div>

        <h2>📋 Vector Data</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Magnitude</th>
                    <th>Entropy</th>
                    <th>Components</th>
                </tr>
            </thead>
            <tbody>
                ${state.vectors.map(v => `
                    <tr>
                        <td>${v.id}</td>
                        <td>${this.framework.calculateMagnitude(v.components).toFixed(4)}</td>
                        <td>${this.framework.calculateEntropy(v.components).toFixed(4)}</td>
                        <td class="vector-component">[${v.components.map(c => c.toFixed(3)).join(', ')}]</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        ${state.inputVector ? `
        <h2>🎯 Input Vector</h2>
        <table>
            <tr>
                <td><strong>Magnitude:</strong></td>
                <td>${this.framework.calculateMagnitude(state.inputVector.components).toFixed(4)}</td>
            </tr>
            <tr>
                <td><strong>Entropy:</strong></td>
                <td>${this.framework.calculateEntropy(state.inputVector.components).toFixed(4)}</td>
            </tr>
            <tr>
                <td><strong>Components:</strong></td>
                <td class="vector-component">[${state.inputVector.components.map(c => c.toFixed(3)).join(', ')}]</td>
            </tr>
        </table>
        ` : ''}

        <h2>🔍 Analysis Summary</h2>
        <p>This report contains a comprehensive analysis of the vector dataset exported from VectoVerse. 
        The vectors are visualized as "information atoms" with properties inspired by quantum mechanics 
        and atomic physics.</p>
        
        <p><strong>Key Findings:</strong></p>
        <ul>
            <li>Dataset contains ${state.vectors.length} vectors in ${state.vectors[0]?.components.length || 0}-dimensional space</li>
            <li>Average vector magnitude: ${analysis.averageMagnitude.toFixed(4)}</li>
            <li>Average information entropy: ${analysis.averageEntropy.toFixed(4)}</li>
            <li>Generated using atomic-inspired visualization framework</li>
        </ul>
    </div>
</body>
</html>
        `.trim();
        
        this.downloadFile(
            html,
            'vectoverse-report.html',
            'text/html'
        );
    }

    /**
     * Generate analysis data for exports
     */
    generateAnalysisData() {
        const state = this.framework.getState();
        const vectors = state.vectors;
        
        if (vectors.length === 0) {
            return {
                averageMagnitude: 0,
                averageEntropy: 0,
                vectorCount: 0,
                dimensions: 0
            };
        }
        
        const magnitudes = vectors.map(v => this.framework.calculateMagnitude(v.components));
        const entropies = vectors.map(v => this.framework.calculateEntropy(v.components));
        
        return {
            vectorCount: vectors.length,
            dimensions: vectors[0].components.length,
            averageMagnitude: magnitudes.reduce((sum, mag) => sum + mag, 0) / magnitudes.length,
            averageEntropy: entropies.reduce((sum, ent) => sum + ent, 0) / entropies.length,
            magnitudes: magnitudes,
            entropies: entropies
        };
    }

    /**
     * Generate LaTeX table for vectors
     */
    generateLaTeXVectorTable(vectors) {
        if (vectors.length === 0) return '';
        
        const dimensions = vectors[0].components.length;
        const headers = ['ID', ...Array.from({length: dimensions}, (_, i) => `$v_{${i}}$`), 'Magnitude'];
        
        let table = `\\begin{table}[h]\n\\centering\n\\begin{tabular}{${'l'.repeat(headers.length)}}\n\\toprule\n`;
        table += headers.join(' & ') + ' \\\\\n\\midrule\n';
        
        vectors.forEach(v => {
            const row = [
                v.id,
                ...v.components.map(c => c.toFixed(3)),
                this.framework.calculateMagnitude(v.components).toFixed(3)
            ];
            table += row.join(' & ') + ' \\\\\n';
        });
        
        table += '\\bottomrule\n\\end{tabular}\n\\caption{Vector components and magnitudes}\n\\end{table}';
        return table;
    }

    /**
     * Get SVG styles for standalone export
     */
    getSVGStyles() {
        return `
            .vector-atom { cursor: pointer; }
            .force-line { stroke-opacity: 0.6; }
            .bg-particle { fill: rgba(255,255,255,0.1); }
            text { font-family: Arial, sans-serif; }
        `;
    }

    /**
     * Download file with given content
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

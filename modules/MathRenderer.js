// Mathematical Rendering and KaTeX Integration for VectoVerse
export class MathRenderer {
    constructor(framework) {
        this.framework = framework;
        this.isKaTeXReady = false;
        this.pendingRenders = [];
        this.init();
    }

    async init() {
        this.waitForKaTeX();
    }

    waitForKaTeX() {
        if (typeof window.katex !== 'undefined' && typeof window.renderMathInElement !== 'undefined') {
            this.isKaTeXReady = true;
            this.processPendingRenders();
            console.log('MathRenderer: KaTeX is ready');
        } else {
            setTimeout(() => this.waitForKaTeX(), 100);
        }
    }

    processPendingRenders() {
        while (this.pendingRenders.length > 0) {
            const render = this.pendingRenders.shift();
            this.renderMath(render.element, render.options);
        }
    }

    renderMath(element = document.body, options = {}) {
        if (!this.isKaTeXReady) {
            this.pendingRenders.push({ element, options });
            return;
        }

        try {
            const defaultOptions = {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError: false,
                errorColor: '#cc0000',
                strict: false,
                trust: true,
                macros: {
                    "\\vec": "\\mathbf{#1}",
                    "\\norm": "\\left\\|#1\\right\\|",
                    "\\dot": "\\cdot",
                    "\\similarity": "\\text{sim}(#1, #2)",
                    "\\cosinesim": "\\cos\\theta_{#1,#2}",
                    "\\magnitude": "\\|#1\\|"
                }
            };

            const finalOptions = { ...defaultOptions, ...options };
            window.renderMathInElement(element, finalOptions);
        } catch (error) {
            console.warn('Math rendering error:', error);
        }
    }

    // Utility methods for creating mathematical expressions
    createVectorNotation(components) {
        if (!Array.isArray(components)) return '';
        const componentStr = components.map(c => c.toFixed(2)).join(', ');
        return `\\vec{v} = \\begin{pmatrix} ${componentStr.replace(/,/g, ' \\\\ ')} \\end{pmatrix}`;
    }

    createMagnitudeFormula(components) {
        if (!Array.isArray(components)) return '';
        const squares = components.map((_, i) => `v_{${i+1}}^2`).join(' + ');
        return `\\|\\vec{v}\\| = \\sqrt{${squares}}`;
    }

    createDotProductFormula(v1, v2) {
        if (!Array.isArray(v1) || !Array.isArray(v2)) return '';
        const products = v1.map((_, i) => `v_{1,${i+1}} \\cdot v_{2,${i+1}}`).join(' + ');
        return `\\vec{v_1} \\cdot \\vec{v_2} = ${products}`;
    }

    createCosineSimilarityFormula() {
        return `\\cosinesim{\\vec{a}}{\\vec{b}} = \\frac{\\vec{a} \\cdot \\vec{b}}{\\|\\vec{a}\\| \\|\\vec{b}\\|}`;
    }

    createEuclideanDistanceFormula() {
        return `d(\\vec{a}, \\vec{b}) = \\sqrt{\\sum_{i=1}^{n} (a_i - b_i)^2}`;
    }

    createResonanceForceFormula() {
        return `R(\\vec{u}, \\vec{v}) = \\frac{(\\vec{u} \\cdot \\vec{v})^2}{\\|\\vec{u} - \\vec{v}\\|^2 + \\epsilon}`;
    }

    // Dynamic content rendering
    renderVectorAnalysis(vectorData) {
        const { vector, magnitude, normalized } = vectorData;
        
        return `
            <div class="math-analysis">
                <h4>Vector Analysis</h4>
                <div class="math-section">
                    <p><strong>Original Vector:</strong></p>
                    <div class="math-display">$${this.createVectorNotation(vector.components)}$$</div>
                </div>
                <div class="math-section">
                    <p><strong>Magnitude:</strong></p>
                    <div class="math-display">$$\\|\\vec{v}\\| = ${magnitude.toFixed(3)}$$</div>
                </div>
                <div class="math-section">
                    <p><strong>Normalized Vector:</strong></p>
                    <div class="math-display">$$\\hat{v} = ${this.createVectorNotation(normalized)}$$</div>
                </div>
            </div>
        `;
    }

    renderSimilarityAnalysis(vector1, vector2, similarity, distance) {
        return `
            <div class="math-analysis">
                <h4>Similarity Analysis</h4>
                <div class="math-section">
                    <p><strong>Cosine Similarity:</strong></p>
                    <div class="math-display">${this.createCosineSimilarityFormula()}</div>
                    <div class="math-result">$$\\cosinesim{\\vec{a}}{\\vec{b}} = ${similarity.toFixed(3)}$$</div>
                </div>
                <div class="math-section">
                    <p><strong>Euclidean Distance:</strong></p>
                    <div class="math-display">${this.createEuclideanDistanceFormula()}</div>
                    <div class="math-result">$$d(\\vec{a}, \\vec{b}) = ${distance.toFixed(3)}$$</div>
                </div>
            </div>
        `;
    }

    renderForceAnalysis(forceType, force, vectors) {
        let forceFormula = '';
        let forceName = '';

        switch (forceType) {
            case 'resonance':
                forceFormula = this.createResonanceForceFormula();
                forceName = 'Resonance Force';
                break;
            case 'electromagnetic':
                forceFormula = `F_{em} = k \\frac{q_1 q_2}{r^2}`;
                forceName = 'Electromagnetic Force';
                break;
            case 'gravitational':
                forceFormula = `F_g = G \\frac{m_1 m_2}{r^2}`;
                forceName = 'Gravitational Force';
                break;
        }

        return `
            <div class="math-analysis">
                <h4>${forceName} Analysis</h4>
                <div class="math-section">
                    <p><strong>Formula:</strong></p>
                    <div class="math-display">$$${forceFormula}$$</div>
                    <div class="math-result">$$F = ${force.toFixed(3)}$$</div>
                </div>
            </div>
        `;
    }

    // Update existing DOM elements with math
    updateMathContent(elementId, content) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = content;
            this.renderMath(element);
        }
    }

    // Create styled math containers
    createMathContainer(content, className = 'math-container') {
        const container = document.createElement('div');
        container.className = className;
        container.innerHTML = content;
        this.renderMath(container);
        return container;
    }

    // Add mathematical explanations to the UI
    enhanceUI() {
        this.addMathTooltips();
        this.addMathExplanations();
    }

    addMathTooltips() {
        // Add mathematical tooltips to UI elements
        const tooltips = {
            '#dimensions': 'Dimensionality affects the geometry of the vector space: $d = \\text{number of components}$',
            '#vectors': 'Each vector represents a point in $\\mathbb{R}^d$ space',
            '#regenerate': 'Generates new random vectors with uniform distribution',
            '#toggle-forces': 'Visualizes attractive/repulsive forces: $F \\propto \\frac{\\text{similarity}}{\\text{distance}^2}$'
        };

        Object.entries(tooltips).forEach(([selector, formula]) => {
            const element = document.querySelector(selector);
            if (element) {
                element.setAttribute('data-math-tooltip', formula);
                element.addEventListener('mouseenter', (e) => this.showMathTooltip(e, formula));
                element.addEventListener('mouseleave', () => this.hideMathTooltip());
            }
        });
    }

    showMathTooltip(event, formula) {
        const tooltip = document.createElement('div');
        tooltip.className = 'math-tooltip';
        tooltip.innerHTML = `<div class="math-content">$${formula}$</div>`;
        
        document.body.appendChild(tooltip);
        this.renderMath(tooltip);

        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 10}px`;
    }

    hideMathTooltip() {
        const tooltip = document.querySelector('.math-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    addMathExplanations() {
        // Add mathematical context to existing explanations
        const explanations = document.querySelectorAll('.concept-explanation');
        explanations.forEach(explanation => {
            this.renderMath(explanation);
        });
    }

    // Cleanup
    destroy() {
        const tooltips = document.querySelectorAll('.math-tooltip');
        tooltips.forEach(tooltip => tooltip.remove());
    }
}

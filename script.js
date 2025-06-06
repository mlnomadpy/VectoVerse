// Import dependencies
import * as d3 from 'd3';
import katex from 'katex';
import renderMathInElement from 'katex/dist/contrib/auto-render.mjs';
import 'katex/dist/katex.css';
import { VectorAtomicFramework } from './modules/VectorAtomicFramework.js';

// Make D3 available globally
window.d3 = d3;

// Initialize KaTeX globally
function initializeKaTeX() {
    try {
        // Make KaTeX available globally
        window.katex = katex;
        window.renderMathInElement = renderMathInElement;
        
        // Configure and render math
        renderMathInElement(document.body, {
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
                "\\cos": "\\text{cos}",
                "\\sin": "\\text{sin}",
                "\\dot": "\\cdot"
            }
        });
        
        // Create global renderMath function
        window.renderMath = function(element = document.body) {
            try {
                renderMathInElement(element, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\(', right: '\\)', display: false},
                        {left: '\\[', right: '\\]', display: true}
                    ],
                    throwOnError: false,
                    errorColor: '#cc0000',
                    strict: false,
                    macros: {
                        "\\vec": "\\mathbf{#1}",
                        "\\norm": "\\left\\|#1\\right\\|",
                        "\\cos": "\\text{cos}",
                        "\\sin": "\\text{sin}",
                        "\\dot": "\\cdot"
                    }
                });
            } catch (error) {
                console.warn('Math rendering error:', error);
            }
        };
        
        console.log('KaTeX initialized successfully with npm package');
        return true;
    } catch (error) {
        console.error('KaTeX initialization failed:', error);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize KaTeX first
    const katexLoaded = initializeKaTeX();
    
    // Initialize the framework
    try {
        const framework = new VectorAtomicFramework();
        window.VectoVerse = framework; // For debugging
        console.log('VectoVerse initialized successfully!');
        
        if (katexLoaded) {
            // Re-render math after framework initialization
            setTimeout(() => window.renderMath(), 100);
        }

        // Setup collapsible panels
        document.querySelectorAll('.sidebar-panel.collapsible > h3').forEach(header => {
            header.addEventListener('click', () => {
                const panel = header.parentElement;
                panel.classList.toggle('collapsed');
            });
        });
    } catch (error) {
        console.error('Failed to initialize VectoVerse:', error);
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 50px; color: #ff4757;">
                    <h2>⚠️ Error Loading VectoVerse</h2>
                    <p>Please refresh the page and try again.</p>
                    <p style="font-size: 0.8em; opacity: 0.7;">Error: ${error.message}</p>
                    <button onclick="location.reload()" style="
                        margin-top: 20px; 
                        padding: 10px 20px; 
                        background: #667eea; 
                        color: white; 
                        border: none; 
                        border-radius: 8px; 
                        cursor: pointer;
                    ">Reload Page</button>
                </div>
            `;
        }
    }
});
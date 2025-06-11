import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/styles/main.css'
import './assets/styles/theme.css'

// Import KaTeX and D3 globally
import * as d3 from 'd3'
import katex from 'katex'
import renderMathInElement from 'katex/dist/contrib/auto-render.mjs'
import 'katex/dist/katex.css'

// Make D3 and KaTeX available globally for existing modules
window.d3 = d3
window.katex = katex
window.renderMathInElement = renderMathInElement

// Initialize KaTeX globally
function initializeKaTeX() {
    try {
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
        })
        
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
                })
            } catch (error) {
                console.warn('Math rendering error:', error)
            }
        }
        
        console.log('KaTeX initialized successfully')
        return true
    } catch (error) {
        console.error('KaTeX initialization failed:', error)
        return false
    }
}

// Initialize the Vue app
const app = createApp(App)
const pinia = createPinia()

// Use Pinia
app.use(pinia)

// Initialize KaTeX before mounting
initializeKaTeX()

// Mount the app
app.mount('#app') 
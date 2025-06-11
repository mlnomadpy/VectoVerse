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
        
        // Initialize periodic table
        const visualizationContainer = document.querySelector('.visualization-container');
        if (visualizationContainer) {
            framework.initializePeriodicTable(visualizationContainer);
            console.log('Periodic table initialized');
        }
        
        // Setup enhanced controls
        setupEnhancedControls(framework);
        
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

// Setup enhanced controls for new features
function setupEnhancedControls(framework) {
    // Neural Network Mode Toggle
    const neuralModeToggle = document.getElementById('toggle-neural-mode');
    if (neuralModeToggle) {
        neuralModeToggle.addEventListener('click', () => {
            const isActive = framework.isNeuralModeActive();
            
            if (isActive) {
                framework.deactivateNeuralNetworkMode();
                neuralModeToggle.setAttribute('data-state', 'off');
                neuralModeToggle.querySelector('.btn-state').textContent = 'OFF';
                neuralModeToggle.classList.remove('active');
            } else {
                const selectedVector = framework.getState().selectedVectorId;
                framework.activateNeuralNetworkMode(selectedVector);
                neuralModeToggle.setAttribute('data-state', 'on');
                neuralModeToggle.querySelector('.btn-state').textContent = 'ON';
                neuralModeToggle.classList.add('active');
            }
        });
    }

    // Force Type Selector
    const forceTypeSelect = document.getElementById('force-type');
    if (forceTypeSelect) {
        forceTypeSelect.addEventListener('change', (event) => {
            framework.setForceType(event.target.value);
            console.log(`Force type changed to: ${event.target.value}`);
            
            // If neural mode is active, recalculate the network with the new metric
            if (framework.isNeuralModeActive()) {
                framework.modules.neuralNetworkMode.updateNeuralNetwork();
            }
        });
    }

    // Activation Function Selector
    const activationFunctionSelect = document.getElementById('activation-function');
    if (activationFunctionSelect) {
        // Set initial value
        activationFunctionSelect.value = framework.getActivationFunction();
        
        activationFunctionSelect.addEventListener('change', (event) => {
            framework.setActivationFunction(event.target.value);
            console.log(`Activation function changed to: ${event.target.value}`);
        });
    }

    // Learning Rate Slider
    const learningRateSlider = document.getElementById('learning-rate');
    const learningRateValue = document.getElementById('lr-value');
    if (learningRateSlider && learningRateValue) {
        // Set initial values
        learningRateSlider.value = framework.getLearningRate();
        learningRateValue.textContent = framework.getLearningRate().toFixed(3);
        
        learningRateSlider.addEventListener('input', (event) => {
            const rate = parseFloat(event.target.value);
            framework.setLearningRate(rate);
            learningRateValue.textContent = rate.toFixed(3);
        });
    }

    // Listen for neural mode events
    framework.eventBus.on('neuralModeActivated', (data) => {
        console.log('Neural network mode activated with input vector:', data.inputVectorId);
        if (neuralModeToggle) {
            neuralModeToggle.setAttribute('data-state', 'on');
            neuralModeToggle.querySelector('.btn-state').textContent = 'ON';
            neuralModeToggle.classList.add('active');
        }
    });

    framework.eventBus.on('neuralModeDeactivated', () => {
        console.log('Neural network mode deactivated');
        if (neuralModeToggle) {
            neuralModeToggle.setAttribute('data-state', 'off');
            neuralModeToggle.querySelector('.btn-state').textContent = 'OFF';
            neuralModeToggle.classList.remove('active');
        }
    });

    // Listen for activation function changes
    framework.eventBus.on('activationFunctionChanged', (data) => {
        console.log('Activation function changed to:', data.function);
        // Update UI tooltip to show current function
        if (activationFunctionSelect) {
            activationFunctionSelect.parentElement.setAttribute('data-tooltip', 
                `Current: ${data.function.charAt(0).toUpperCase() + data.function.slice(1)} Activation`);
        }
    });

    // Listen for learning rate changes
    framework.eventBus.on('learningRateChanged', (data) => {
        console.log('Learning rate changed to:', data.rate);
        // Update UI tooltip to show current rate
        if (learningRateSlider) {
            learningRateSlider.parentElement.setAttribute('data-tooltip', 
                `Learning Rate: ${data.rate.toFixed(3)} (${data.rate >= 0.05 ? 'Fast' : data.rate >= 0.01 ? 'Medium' : 'Slow'})`);
        }
    });

    // Enhanced keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'n':
                    event.preventDefault();
                    neuralModeToggle?.click();
                    break;
                case 'f':
                    event.preventDefault();
                    // Cycle through force types
                    const currentIndex = framework.getAvailableForceTypes().indexOf(
                        framework.getConfig().forceType || 'resonance'
                    );
                    const nextIndex = (currentIndex + 1) % framework.getAvailableForceTypes().length;
                    const nextForceType = framework.getAvailableForceTypes()[nextIndex];
                    framework.setForceType(nextForceType);
                    if (forceTypeSelect) {
                        forceTypeSelect.value = nextForceType;
                    }
                    break;
                case 'a':
                    event.preventDefault();
                    // Cycle through activation functions (only when neural mode is active)
                    if (framework.isNeuralModeActive()) {
                        const currentActivationIndex = framework.getAvailableActivationFunctions().indexOf(
                            framework.getActivationFunction()
                        );
                        const nextActivationIndex = (currentActivationIndex + 1) % framework.getAvailableActivationFunctions().length;
                        const nextActivationFunction = framework.getAvailableActivationFunctions()[nextActivationIndex];
                        framework.setActivationFunction(nextActivationFunction);
                        if (activationFunctionSelect) {
                            activationFunctionSelect.value = nextActivationFunction;
                        }
                    }
                    break;
            }
        }
    });
}
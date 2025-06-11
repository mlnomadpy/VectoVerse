import { VectorRenderer } from './VectorRenderer.js';
import { ForceCalculator } from './ForceCalculator.js';
import { EnhancedForceCalculator } from './EnhancedForceCalculator.js';
import { UIController } from './UIController.js';
import { FileHandler } from './FileHandler.js';
import { AnimationEngine } from './AnimationEngine.js';
import { StateManager } from './StateManager.js';
import { EventBus } from './EventBus.js';
import { ConfigManager } from './ConfigManager.js';
import { KeyboardShortcuts } from './KeyboardShortcuts.js';
import { VectorOperations } from './VectorOperations.js';
import { AnalysisEngine } from './AnalysisEngine.js';
import { ThreeJSVisualization } from './ThreeJSVisualization.js';
import { PeriodicTableVisualization } from './PeriodicTableVisualization.js';
import { NeuralNetworkMode } from './NeuralNetworkMode.js';
import { VectorAnalysisStudio } from './VectorAnalysisStudio.js';

export class VectorAtomicFramework {
    constructor() {
        // Wait for D3 to be available globally
        if (typeof window.d3 === 'undefined') {
            throw new Error('D3.js is not loaded. Please ensure D3 is available globally before initializing VectorAtomicFramework.');
        }
        
        this.eventBus = new EventBus();
        this.configManager = new ConfigManager();
        this.stateManager = new StateManager(this);

        const config = this.configManager.getConfig();
        this.svg = window.d3.select("#main-viz")
            .attr("width", config.width)
            .attr("height", config.height)
            .attr("viewBox", `0 0 ${config.width} ${config.height}`);        // Initialize modules
        this.modules = {
            forceCalculator: new EnhancedForceCalculator(), // Use enhanced calculator
            vectorRenderer: new VectorRenderer(this.svg, this),
            uiController: new UIController(this),
            fileHandler: new FileHandler(this),
            animationEngine: new AnimationEngine(this.svg, this),
            keyboardShortcuts: new KeyboardShortcuts(this),
            vectorOperations: VectorOperations,
            analysisEngine: new AnalysisEngine(this),
            threeJSVisualization: null,  // Will be initialized when 3D panel is created
            periodicTableVisualization: null, // Will be initialized with container
            neuralNetworkMode: new NeuralNetworkMode(this),
            vectorAnalysisStudio: null  // Will be initialized after setup
        };

        // Pass the ui controller to the file handler
        this.modules.fileHandler.ui = this.modules.uiController;

        // Initialize the Vector Analysis Studio after all modules are set up
        this.modules.vectorAnalysisStudio = new VectorAnalysisStudio(this);

        this.initialize();
    }

    initialize() {
        this.eventBus.on('stateChanged', (eventData) => {
            // Determine if we need a full re-render based on the event type
            const needsFullRender = eventData && eventData.fullRender;
            this.render(needsFullRender);
        });
        this.eventBus.on('configChanged', () => {
            this.render(true); // Config changes always need full re-render
            this.modules.uiController.updateControls();
        });
        this.modules.uiController.setupControls();
        this.stateManager.generateVectors();
        this.modules.animationEngine.start();
        this.modules.keyboardShortcuts.initialize();
    }

    render(forceFullRender = false) {
        this.modules.vectorRenderer.render(forceFullRender);
        this.modules.uiController.updateVectorDetails();
    }

    updateConfig(key, value) {
        this.configManager.updateConfig(key, value);
        if (key === 'dimensions' || key === 'numVectors') {
            this.stateManager.generateVectors();
        }
        this.eventBus.emit('configChanged');
    }

    // Utility method for rendering math formulas
    renderMath(element = document.body) {
        if (typeof window.renderMathInElement === 'function') {
            try {
                window.renderMathInElement(element, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\(', right: '\\)', display: false},
                        {left: '\\[', right: '\\]', display: true}
                    ],
                    throwOnError: false,
                    errorColor: '#cc0000',
                    strict: false,
                    trust: true
                });
            } catch (error) {
                console.warn('KaTeX rendering failed:', error);
            }
        }
    }

    selectVector(vectorId) {
        this.stateManager.selectVector(vectorId);
    }

    addInputVector() {
        this.modules.uiController.showAddVectorModal();
    }

    getState() {
        return this.stateManager.state;
    }

    getConfig() {
        return this.configManager.getConfig();
    }

    getModules() {
        return this.modules;
    }

    notify(event, data) {
        this.eventBus.emit(event, data);
    }

    // 3D visualization methods
    initialize3DVisualization(container) {
        if (this.modules.threeJSVisualization) {
            this.modules.threeJSVisualization.dispose();
        }
        
        this.modules.threeJSVisualization = new ThreeJSVisualization(container, this);
        
        // Subscribe to relevant events
        this.eventBus.on('vectorsUpdated', () => {
            if (this.modules.threeJSVisualization) {
                this.modules.threeJSVisualization.onVectorsUpdated(this.stateManager.getVectors());
            }
        });
        
        this.eventBus.on('analysisCompleted', (data) => {
            if (this.modules.threeJSVisualization) {
                this.modules.threeJSVisualization.onAnalysisCompleted(data);
            }
        });
        
        this.eventBus.on('vectorSelected', (data) => {
            if (this.modules.threeJSVisualization) {
                this.modules.threeJSVisualization.onVectorSelected(data);
            }
        });
        
        // Initialize with current vectors
        const vectors = this.stateManager.getVectors();
        if (vectors.length > 0) {
            this.modules.threeJSVisualization.onVectorsUpdated(vectors);
        }
        
        return this.modules.threeJSVisualization;
    }
    
    dispose3DVisualization() {
        if (this.modules.threeJSVisualization) {
            this.modules.threeJSVisualization.dispose();
            this.modules.threeJSVisualization = null;
        }
    }
    
    update3DSettings(settings) {
        if (this.modules.threeJSVisualization) {
            this.modules.threeJSVisualization.updateSettings(settings);
        }
    }
    
    export3DScene() {
        if (this.modules.threeJSVisualization) {
            return this.modules.threeJSVisualization.exportScene();
        }
        return null;
    }
    
    import3DScene(sceneData) {
        if (this.modules.threeJSVisualization) {
            this.modules.threeJSVisualization.importScene(sceneData);
        }
    }

    // Periodic Table methods
    initializePeriodicTable(container) {
        if (this.modules.periodicTableVisualization) {
            // Remove existing periodic table
            this.modules.periodicTableVisualization = null;
        }
        
        this.modules.periodicTableVisualization = new PeriodicTableVisualization(container, this);
        return this.modules.periodicTableVisualization;
    }

    // Neural Network Mode methods
    activateNeuralNetworkMode(inputVectorId = null) {
        this.modules.neuralNetworkMode.activate(inputVectorId);
    }

    deactivateNeuralNetworkMode() {
        this.modules.neuralNetworkMode.deactivate();
    }

    isNeuralModeActive() {
        return this.modules.neuralNetworkMode.isNeuralModeActive();
    }

    setActivationFunction(functionType) {
        this.modules.forceCalculator.activationFunction = functionType;
        // Update neural network if active
        if (this.isNeuralModeActive()) {
            this.modules.neuralNetworkMode.updateNeuralNetwork();
        }
        this.notify('activationFunctionChanged', { function: functionType });
    }

    getActivationFunction() {
        return this.modules.forceCalculator.activationFunction;
    }

    setLearningRate(rate) {
        this.modules.forceCalculator.learningRate = rate;
        // Update neural network if active
        if (this.isNeuralModeActive()) {
            this.modules.neuralNetworkMode.updateNeuralNetwork();
        }
        this.notify('learningRateChanged', { rate: rate });
    }

    getLearningRate() {
        return this.modules.forceCalculator.learningRate;
    }

    getAvailableActivationFunctions() {
        return ['sigmoid', 'tanh', 'relu', 'leaky_relu', 'softplus', 'swish', 'softmax', 'softermax', 'soft_sigmoid'];
    }

    // Enhanced configuration methods
    setForceType(forceType) {
        this.updateConfig('forceType', forceType);
    }

    getAvailableForceTypes() {
        return ['resonance', 'cosine', 'correlation', 'euclidean', 'manhattan', 'quantum'];
    }

    // Enhanced vector analysis
    getEnhancedVectorAnalysis(vectorId) {
        const vector = this.stateManager.state.vectors.find(v => v.id === vectorId);
        if (!vector) return null;

        const allVectors = this.stateManager.state.vectors;
        return this.modules.forceCalculator.getEnhancedVectorStatistics(vector, allVectors);
    }

    // Export enhanced data
    exportEnhancedData() {
        const state = this.getState();
        const config = this.getConfig();
        
        return {
            vectors: state.vectors,
            inputVector: state.inputVector,
            selectedVectorId: state.selectedVectorId,
            config: config,
            periodicTableData: this.modules.periodicTableVisualization ? 
                this.modules.periodicTableVisualization.exportPeriodicData() : null,
            neuralNetworkData: this.modules.neuralNetworkMode.isNeuralModeActive() ? 
                this.modules.neuralNetworkMode.exportNeuralNetworkData() : null,
            timestamp: new Date().toISOString(),
            version: '2.0.0'
        };
    }
}
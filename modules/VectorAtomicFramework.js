import { VectorRenderer } from './VectorRenderer.js';
import { ForceCalculator } from './ForceCalculator.js';
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
            forceCalculator: new ForceCalculator(),
            vectorRenderer: new VectorRenderer(this.svg, this),
            uiController: new UIController(this),
            fileHandler: new FileHandler(this),
            animationEngine: new AnimationEngine(this.svg, this),
            keyboardShortcuts: new KeyboardShortcuts(this),
            vectorOperations: VectorOperations,
            analysisEngine: new AnalysisEngine(this),
            threeJSVisualization: null  // Will be initialized when 3D panel is created
        };

        // Pass the ui controller to the file handler
        this.modules.fileHandler.ui = this.modules.uiController;

        this.initialize();
    }

    initialize() {
        this.eventBus.on('stateChanged', () => this.render());
        this.eventBus.on('configChanged', () => {
            this.render();
            this.modules.uiController.updateControls();
        });
        this.modules.uiController.setupControls();
        this.stateManager.generateVectors();
        this.modules.animationEngine.start();
        this.modules.keyboardShortcuts.initialize();
    }

    render() {
        this.modules.vectorRenderer.render();
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
        this.stateManager.addInputVector();
        this.modules.uiController.showInputEditor();
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
}
import { VectorRenderer } from './VectorRenderer.js';
import { ForceCalculator } from './ForceCalculator.js';
import { UIController } from './UIController.js';
import { FileHandler } from './FileHandler.js';
import { AnimationEngine } from './AnimationEngine.js';
import { Constants } from './Constants.js';

export class VectorAtomicFramework {
    constructor() {
        this.state = {
            vectors: [],
            inputVector: null,
            selectedVector: null
        };

        this.config = {
            width: 800,
            height: 600,
            dimensions: 4,
            numVectors: 6,
            showForces: false
        };

        this.svg = d3.select("#main-viz")
            .attr("width", this.config.width)
            .attr("height", this.config.height)
            .attr("viewBox", `0 0 ${this.config.width} ${this.config.height}`);

        // Initialize modules
        this.modules = {
            forceCalculator: new ForceCalculator(),
            vectorRenderer: new VectorRenderer(this.svg, this),
            uiController: new UIController(this),
            fileHandler: new FileHandler(this),
            animationEngine: new AnimationEngine(this.svg, this)
        };

        this.initialize();
    }

    initialize() {
        this.modules.uiController.setupControls();
        this.generateVectors();
        this.render();
        this.modules.animationEngine.start();
    }

    generateVectors() {
        this.state.vectors = [];
        const margin = 80;

        for (let i = 0; i < this.config.numVectors; i++) {
            const vector = {
                id: i,
                components: [],
                x: Math.random() * (this.config.width - 2 * margin) + margin,
                y: Math.random() * (this.config.height - 2 * margin) + margin
            };

            for (let d = 0; d < this.config.dimensions; d++) {
                vector.components.push((Math.random() - 0.5) * 2);
            }

            this.state.vectors.push(vector);
        }

        this.state.selectedVector = null;
        this.state.inputVector = null;
    }

    render() {
        this.modules.vectorRenderer.render();
        this.modules.uiController.updateVectorDetails();
    }

    updateConfig(key, value) {
        this.config[key] = value;
        if (key === 'dimensions' || key === 'numVectors') {
            this.generateVectors();
        }
        this.render();
    }

    selectVector(vectorId) {
        this.state.selectedVector = this.state.vectors.find(v => v.id === vectorId);
        this.modules.vectorRenderer.updateVectorSelection();
        this.modules.uiController.updateVectorDetails();
    }

    addInputVector() {
        const inputVector = {
            id: 'input',
            components: [],
            x: Math.random() * (this.config.width - 100) + 50,
            y: Math.random() * (this.config.height - 100) + 50,
            isInput: true
        };

        for (let d = 0; d < this.config.dimensions; d++) {
            inputVector.components.push((Math.random() - 0.5) * 2);
        }

        this.state.inputVector = inputVector;
        this.render();
        this.modules.uiController.showInputEditor();
    }

    getState() { 
        return this.state; 
    }

    getConfig() { 
        return this.config; 
    }

    getModules() { 
        return this.modules; 
    }

    // Convenience methods for accessing calculations
    calculateMagnitude(vector) {
        return this.modules.forceCalculator.magnitude(vector);
    }

    calculateEntropy(vector) {
        return this.modules.forceCalculator.informationEntropy(vector);
    }

    classifyQuantumCharge(vector) {
        const quantums = this.modules.forceCalculator.getInformationQuantums(vector);
        if (quantums.excitatory > quantums.inhibitory) return "Positive (Excitatory)";
        if (quantums.inhibitory > quantums.excitatory) return "Negative (Inhibitory)";
        return "Neutral (Balanced)";
    }

    calculateSimilarities(vector) {
        return this.state.vectors
            .filter(other => other.id !== vector.id)
            .map(other => ({
                index: other.id,
                similarity: this.modules.forceCalculator.cosineSimilarity(vector, other),
                resonanceForce: this.modules.forceCalculator.resonanceForce(vector, other),
                correlation: this.modules.forceCalculator.correlation(vector, other),
                entanglement: this.modules.forceCalculator.quantumEntanglement(vector, other)
            }))
            .sort((a, b) => b.resonanceForce - a.resonanceForce);
    }

    getQuantumProperties(vector) {
        return this.modules.forceCalculator.getInformationQuantums(vector);
    }

    getStatisticalProperties(vector) {
        return this.modules.forceCalculator.getVectorStatistics(vector);
    }

    calculateAllForces(v1, v2) {
        return {
            resonance: this.modules.forceCalculator.resonanceForce(v1, v2),
            cosine: this.modules.forceCalculator.cosineSimilarity(v1, v2),
            electromagnetic: this.modules.forceCalculator.electromagneticForce(v1, v2),
            gravitational: this.modules.forceCalculator.gravitationalAttraction(v1, v2),
            correlation: this.modules.forceCalculator.correlation(v1, v2),
            entanglement: this.modules.forceCalculator.quantumEntanglement(v1, v2),
            harmonicAlignment: this.modules.forceCalculator.harmonicAlignment(v1, v2)
        };
    }
}
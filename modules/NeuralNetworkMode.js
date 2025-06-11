import { Constants } from './Constants.js';

export class NeuralNetworkMode {
    constructor(framework) {
        this.framework = framework;
        this.d3 = window.d3;
        this.isActive = false;
        this.inputVector = null;
        this.neuronVectors = [];
        this.connections = [];
        this.activations = [];
        
        this.config = {
            connectionOpacity: 0.6,
            activationThreshold: 0.5,
            maxConnectionWidth: 8,
            minConnectionWidth: 1,
            activationColors: {
                high: '#ff6b6b',
                medium: '#ffa726',
                low: '#66bb6a',
                inactive: '#95a5a6'
            }
        };
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.framework.eventBus.on('vectorSelected', (data) => {
            if (this.isActive && data.vectorId !== null) {
                this.setInputVector(data.vectorId);
            }
        });

        this.framework.eventBus.on('stateChanged', () => {
            if (this.isActive) {
                this.updateNeuralNetwork();
            }
        });
    }

    activate(inputVectorId = null) {
        this.isActive = true;
        
        if (inputVectorId !== null) {
            this.setInputVector(inputVectorId);
        } else {
            const state = this.framework.getState();
            if (state.vectors.length > 0) {
                this.setInputVector(state.vectors[0].id);
            }
        }
        
        this.updateNeuralNetwork();
        this.framework.notify('neuralModeActivated', { inputVectorId: this.inputVector?.id });
    }

    deactivate() {
        this.isActive = false;
        this.inputVector = null;
        this.neuronVectors = [];
        this.connections = [];
        this.activations = [];
        
        this.clearNeuralVisualizations();
        this.framework.notify('neuralModeDeactivated');
    }

    setInputVector(vectorId) {
        const state = this.framework.getState();
        this.inputVector = state.vectors.find(v => v.id === vectorId);
        
        if (this.inputVector) {
            this.neuronVectors = state.vectors.filter(v => v.id !== vectorId);
            this.calculateNeuralNetwork();
            this.renderNeuralNetwork();
        }
    }

    calculateNeuralNetwork() {
        if (!this.inputVector || this.neuronVectors.length === 0) return;

        const forceCalculator = this.framework.getModules().forceCalculator;
        const config = this.framework.getConfig();
        const selectedMetric = config.forceType || 'resonance';
        
        // First pass: calculate all metric values using the selected force type
        const neuronData = this.neuronVectors.map(neuron => {
            const metricValue = forceCalculator.calculateSelectedMetric(this.inputVector, neuron, selectedMetric);
            const correlation = Math.abs(forceCalculator.correlation(this.inputVector, neuron));
            const distance = forceCalculator.euclideanDistance(this.inputVector, neuron);
            const synapticStrength = correlation / (1 + distance);
            
            return {
                neuron,
                metricValue,
                correlation,
                distance,
                synapticStrength
            };
        });

        // Get all metric values for context-dependent activations (softmax, softermax)
        const allMetricValues = neuronData.map(data => data.metricValue);
        
        // Second pass: calculate activations with context if needed
        this.activations = neuronData.map(data => {
            const activationFunc = forceCalculator.activationFunction;
            let activation;
            
            // For softmax and softermax, pass context (all metric values)
            if (activationFunc === 'softmax' || activationFunc === 'softermax') {
                activation = forceCalculator.applyActivation(data.metricValue, activationFunc, allMetricValues);
            } else {
                // For other activation functions, no context needed
                activation = forceCalculator.applyActivation(data.metricValue, activationFunc);
            }

            return {
                neuronId: data.neuron.id,
                activation: activation,
                synapticStrength: data.synapticStrength,
                activationLevel: this.categorizeActivation(activation),
                rawInput: data.metricValue, // Store raw metric value for analysis
                metricType: selectedMetric // Store which metric was used
            };
        });

        this.connections = this.activations.map(activation => ({
            from: this.inputVector.id,
            to: activation.neuronId,
            strength: activation.synapticStrength,
            activation: activation.activation
        }));
    }

    categorizeActivation(activation) {
        const forceCalculator = this.framework.getModules().forceCalculator;
        const activationFunc = forceCalculator.activationFunction;
        
        // Adjust thresholds based on activation function
        switch (activationFunc) {
            case 'tanh':
                // tanh outputs [-1, 1]
                if (Math.abs(activation) > 0.7) return 'high';
                if (Math.abs(activation) > 0.3) return 'medium';
                if (Math.abs(activation) > 0.1) return 'low';
                return 'inactive';
                
            case 'relu':
            case 'leaky_relu':
                // ReLU outputs [0, ∞]
                if (activation > 2.0) return 'high';
                if (activation > 0.5) return 'medium';
                if (activation > 0.1) return 'low';
                return 'inactive';
                
            case 'softplus':
            case 'swish':
                // Softplus/Swish output [0, ∞] but tend to be smaller
                if (activation > 1.5) return 'high';
                if (activation > 0.8) return 'medium';
                if (activation > 0.2) return 'low';
                return 'inactive';
                
            case 'softmax':
            case 'softermax':
                // Softmax and softermax output probabilities [0, 1]
                // But since they're normalized, we use relative thresholds
                if (activation > 0.4) return 'high';    // High probability
                if (activation > 0.2) return 'medium';  // Medium probability
                if (activation > 0.05) return 'low';    // Low but significant probability
                return 'inactive';
                
            case 'soft_sigmoid':
                // Soft-sigmoid outputs [0, 1] like sigmoid
                if (activation > 0.7) return 'high';
                if (activation > 0.4) return 'medium';
                if (activation > 0.1) return 'low';
                return 'inactive';
                
            case 'sigmoid':
            default:
                // Sigmoid outputs [0, 1]
                if (activation > 0.7) return 'high';
                if (activation > 0.4) return 'medium';
                if (activation > 0.1) return 'low';
                return 'inactive';
        }
    }

    updateNeuralNetwork() {
        if (this.isActive && this.inputVector) {
            this.calculateNeuralNetwork();
            this.renderNeuralNetwork();
        }
    }

    renderNeuralNetwork() {
        const svg = this.framework.modules.vectorRenderer.svg;
        
        this.clearNeuralVisualizations();
        this.renderNeuralConnections(svg);
        this.renderNeuralActivations(svg);
        this.renderInputHighlight(svg);
        this.renderNeuralInfoPanel();
    }

    renderNeuralConnections(svg) {
        const connections = this.connections.filter(conn => conn.strength > 0.1);
        
        svg.selectAll('.neural-connection')
            .data(connections, d => `${d.from}-${d.to}`)
            .enter()
            .append('line')
            .attr('class', 'neural-connection')
            .attr('x1', d => this.getVectorPosition(d.from).x)
            .attr('y1', d => this.getVectorPosition(d.from).y)
            .attr('x2', d => this.getVectorPosition(d.to).x)
            .attr('y2', d => this.getVectorPosition(d.to).y)
            .attr('stroke', '#e74c3c')
            .attr('stroke-width', d => {
                const width = this.config.minConnectionWidth + 
                    (d.strength * (this.config.maxConnectionWidth - this.config.minConnectionWidth));
                return Math.max(this.config.minConnectionWidth, Math.min(this.config.maxConnectionWidth, width));
            })
            .attr('opacity', d => this.config.connectionOpacity * d.strength);
    }

    renderNeuralActivations(svg) {
        svg.selectAll('.activation-ring')
            .data(this.activations, d => d.neuronId)
            .enter()
            .append('circle')
            .attr('class', 'activation-ring')
            .attr('cx', d => this.getVectorPosition(d.neuronId).x)
            .attr('cy', d => this.getVectorPosition(d.neuronId).y)
            .attr('r', d => 30 + (d.activation * 20))
            .attr('fill', 'none')
            .attr('stroke', d => this.config.activationColors[d.activationLevel])
            .attr('stroke-width', 3)
            .attr('opacity', 0.7);

        svg.selectAll('.activation-label')
            .data(this.activations, d => d.neuronId)
            .enter()
            .append('text')
            .attr('class', 'activation-label')
            .attr('x', d => this.getVectorPosition(d.neuronId).x + 25)
            .attr('y', d => this.getVectorPosition(d.neuronId).y - 25)
            .attr('fill', 'white')
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .text(d => `${(d.activation * 100).toFixed(0)}%`);
    }

    renderInputHighlight(svg) {
        if (!this.inputVector) return;

        const inputPos = this.getVectorPosition(this.inputVector.id);
        
        svg.append('circle')
            .attr('class', 'neural-input-highlight')
            .attr('cx', inputPos.x)
            .attr('cy', inputPos.y)
            .attr('r', 50)
            .attr('fill', 'none')
            .attr('stroke', '#f39c12')
            .attr('stroke-width', 4)
            .attr('stroke-dasharray', '10,5')
            .attr('opacity', 0.8);

        svg.append('text')
            .attr('class', 'neural-input-label')
            .attr('x', inputPos.x)
            .attr('y', inputPos.y - 60)
            .attr('text-anchor', 'middle')
            .attr('fill', '#f39c12')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .text('🧠 INPUT NEURON');
    }

    renderNeuralInfoPanel() {
        let infoPanel = this.d3.select('.neural-info-panel');
        
        if (infoPanel.empty()) {
            infoPanel = this.d3.select('body')
                .append('div')
                .attr('class', 'neural-info-panel')
                .style('position', 'fixed')
                .style('top', '10px')
                .style('right', '10px')
                .style('width', '250px')
                .style('background', 'rgba(0,0,0,0.9)')
                .style('color', 'white')
                .style('padding', '15px')
                .style('border-radius', '8px')
                .style('font-size', '12px')
                .style('z-index', '1000')
                .style('border', '2px solid #f39c12');
        }

        const networkStats = this.calculateNetworkStatistics();
        const forceCalculator = this.framework.getModules().forceCalculator;
        const activationFunc = forceCalculator.activationFunction;
        const learningRate = forceCalculator.learningRate;
        const config = this.framework.getConfig();
        const selectedMetric = config.forceType || 'resonance';
        
        // Map metric names to display names
        const metricDisplayNames = {
            'resonance': 'Resonance Force',
            'cosine': 'Cosine Similarity',
            'correlation': 'Pearson Correlation',
            'euclidean': 'Euclidean Distance',
            'manhattan': 'Manhattan Distance',
            'quantum': 'Quantum Entanglement'
        };
        
        infoPanel.html(`
            <h4 style="margin: 0 0 10px 0; color: #f39c12;">🧠 Neural Network Mode</h4>
            <div><strong>Input:</strong> Vector ${this.inputVector.id + 1}</div>
            <div><strong>Input Metric:</strong> ${metricDisplayNames[selectedMetric]}</div>
            <div><strong>Activation:</strong> ${activationFunc.charAt(0).toUpperCase() + activationFunc.slice(1)}</div>
            <div><strong>Learning Rate:</strong> ${learningRate.toFixed(3)}</div>
            <div><strong>Neurons:</strong> ${this.neuronVectors.length}</div>
            <div><strong>Connections:</strong> ${this.connections.length}</div>
            <div><strong>Avg Activation:</strong> ${(networkStats.avgActivation * 100).toFixed(1)}%</div>
            <div><strong>Max Activation:</strong> ${(networkStats.maxActivation * 100).toFixed(1)}%</div>
            <div><strong>Network Output:</strong> ${(networkStats.networkOutput * 100).toFixed(1)}%</div>
            <div style="margin-top: 10px;">
                <button id="neural-mode-toggle" style="width: 100%; padding: 5px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Deactivate Neural Mode
                </button>
            </div>
        `);

        infoPanel.select('#neural-mode-toggle')
            .on('click', () => {
                this.deactivate();
            });
    }

    calculateNetworkStatistics() {
        if (this.activations.length === 0) {
            return { avgActivation: 0, maxActivation: 0, networkOutput: 0 };
        }

        const activationValues = this.activations.map(a => a.activation);
        const avgActivation = activationValues.reduce((sum, val) => sum + val, 0) / activationValues.length;
        const maxActivation = Math.max(...activationValues);
        
        const totalActivation = this.activations.reduce((sum, activation) => {
            return sum + (activation.activation * activation.synapticStrength);
        }, 0);
        
        const totalWeight = this.activations.reduce((sum, activation) => {
            return sum + activation.synapticStrength;
        }, 0);
        
        const networkOutput = totalWeight > 0 ? totalActivation / totalWeight : 0;

        return { avgActivation, maxActivation, networkOutput };
    }

    getVectorPosition(vectorId) {
        const state = this.framework.getState();
        const vector = state.vectors.find(v => v.id === vectorId);
        return vector ? { x: vector.x, y: vector.y } : { x: 0, y: 0 };
    }

    clearNeuralVisualizations() {
        const svg = this.framework.modules.vectorRenderer.svg;
        svg.selectAll('.neural-connection').remove();
        svg.selectAll('.activation-ring').remove();
        svg.selectAll('.activation-label').remove();
        svg.selectAll('.neural-input-highlight').remove();
        svg.selectAll('.neural-input-label').remove();
        
        this.d3.selectAll('.neural-info-panel').remove();
    }

    isNeuralModeActive() {
        return this.isActive;
    }

    getCurrentInputVector() {
        return this.inputVector;
    }

    getNeuronActivations() {
        return this.activations;
    }

    getNetworkConnections() {
        return this.connections;
    }
} 
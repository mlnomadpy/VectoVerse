import { ForceCalculator } from './ForceCalculator.js';
import { VectorOperations } from './VectorOperations.js';

export class EnhancedForceCalculator extends ForceCalculator {
    constructor() {
        super();
        this.neuralNetworkMode = false;
        this.inputNeuron = null;
        this.activationFunction = 'sigmoid'; // sigmoid, tanh, relu, leaky_relu
        this.learningRate = 0.01;
        this.temperature = 1.0; // For softmax and attention mechanisms
    }

    // ===== NEURAL NETWORK INSPIRED METRICS =====

    /**
     * ACTIVATION FUNCTIONS: Neural network activation functions
     */
    applyActivation(value, type = this.activationFunction, context = null) {
        switch (type) {
            case 'sigmoid':
                return 1 / (1 + Math.exp(-value));
            case 'tanh':
                return Math.tanh(value);
            case 'relu':
                return Math.max(0, value);
            case 'leaky_relu':
                return value > 0 ? value : 0.01 * value;
            case 'softplus':
                return Math.log(1 + Math.exp(value));
            case 'swish':
                return value / (1 + Math.exp(-value));
            case 'softmax':
                // For softmax, we need all values in the context (array of values)
                if (!context || !Array.isArray(context)) {
                    // Fallback: treat as individual exponential
                    return Math.exp(value);
                }
                const expValues = context.map(v => Math.exp(v));
                const sumExp = expValues.reduce((sum, exp) => sum + exp, 0);
                return Math.exp(value) / sumExp;
            case 'softermax':
                // x / sum(1 + x) - softer version of softmax
                if (!context || !Array.isArray(context)) {
                    // Fallback: treat as individual value
                    return Math.abs(value) / (0.0001 + Math.abs(value));
                }
                const sumSofterMax = context.reduce((sum, v) => sum + (Math.abs(v)), 0);
                return Math.abs(value) / (0.0001 +sumSofterMax);
            case 'soft_sigmoid':
                // 1/(1+|x|) - soft version of sigmoid
                return 1 / (1 + Math.abs(value));
            default:
                return value;
        }
    }

    /**
     * NEURAL ACTIVATION: Treats vector as neuron with weighted inputs
     * Formula: activation(Σ(wi × xi) + bias)
     */
    neuralActivation(inputVector, neuronVector, bias = 0) {
        const weightedSum = this.dotProduct(inputVector, neuronVector) + bias;
        return this.applyActivation(weightedSum);
    }

    /**
     * ATTENTION MECHANISM: Scaled dot-product attention
     * Formula: softmax(Q·K^T / √d) × V
     */
    attentionScore(queryVector, keyVector, valueVector) {
        const dotProduct = this.dotProduct(queryVector, keyVector);
        const scaledScore = dotProduct / Math.sqrt(queryVector.components.length);
        const attention = Math.exp(scaledScore / this.temperature);
        return attention * this.magnitude(valueVector);
    }

    /**
     * SYNAPTIC STRENGTH: Measures connection strength between neurons
     * Combines correlation, distance, and activation potential
     */
    synapticStrength(neuron1, neuron2) {
        const correlation = Math.abs(this.correlation(neuron1, neuron2));
        const distance = this.euclideanDistance(neuron1, neuron2);
        const activationPotential = this.neuralActivation(neuron1, neuron2);
        
        return (correlation * activationPotential) / (1 + distance);
    }

    // ===== ADVANCED PHYSICS METRICS =====

    /**
     * QUANTUM COHERENCE: Measures phase alignment between vectors
     * Based on complex number representation of vectors
     */
    quantumCoherence(v1, v2) {
        const n = v1.components.length;
        let realPart = 0, imagPart = 0;
        
        for (let i = 0; i < n; i++) {
            const phase1 = Math.atan2(v1.components[i], Math.abs(v1.components[i]) || 1);
            const phase2 = Math.atan2(v2.components[i], Math.abs(v2.components[i]) || 1);
            const phaseDiff = phase1 - phase2;
            
            realPart += Math.cos(phaseDiff);
            imagPart += Math.sin(phaseDiff);
        }
        
        return Math.sqrt(realPart * realPart + imagPart * imagPart) / n;
    }

    /**
     * THERMODYNAMIC ENTROPY: Statistical mechanics inspired entropy
     * Measures energy distribution across vector components
     */
    thermodynamicEntropy(vector, temperature = 1.0) {
        const energies = vector.components.map(c => Math.abs(c));
        const totalEnergy = energies.reduce((sum, e) => sum + e, 0);
        
        if (totalEnergy === 0) return 0;
        
        const probabilities = energies.map(e => e / totalEnergy);
        const boltzmannFactors = probabilities.map(p => Math.exp(-p / temperature));
        const partitionFunction = boltzmannFactors.reduce((sum, bf) => sum + bf, 0);
        
        return Math.log(partitionFunction) + 
               probabilities.reduce((entropy, p, i) => 
                   entropy + p * boltzmannFactors[i] / (temperature * partitionFunction), 0);
    }

    /**
     * FIELD STRENGTH: Electromagnetic field strength at a point
     * Formula: E = k × Σ(qi × ri / |ri|³)
     */
    fieldStrength(sourceVectors, testPoint) {
        let fieldX = 0, fieldY = 0, fieldZ = 0;
        const k = 8.99e9; // Coulomb's constant (scaled down)
        
        sourceVectors.forEach(source => {
            const charge = this.magnitude(source);
            const dx = (testPoint.x || 0) - (source.x || 0);
            const dy = (testPoint.y || 0) - (source.y || 0);
            const dz = (testPoint.z || 0) - (source.z || 0);
            
            const distance = Math.sqrt(dx*dx + dy*dy + dz*dz) + this.epsilon;
            const fieldMagnitude = k * charge / (distance * distance * distance);
            
            fieldX += fieldMagnitude * dx;
            fieldY += fieldMagnitude * dy;
            fieldZ += fieldMagnitude * dz;
        });
        
        return Math.sqrt(fieldX*fieldX + fieldY*fieldY + fieldZ*fieldZ);
    }

    /**
     * WAVE INTERFERENCE: Constructive/destructive interference pattern
     * Models vectors as wave functions
     */
    waveInterference(v1, v2, phase1 = 0, phase2 = 0) {
        const amplitude1 = this.magnitude(v1);
        const amplitude2 = this.magnitude(v2);
        const phaseDiff = phase2 - phase1;
        
        // Resultant amplitude using wave superposition
        const resultantAmplitude = Math.sqrt(
            amplitude1*amplitude1 + amplitude2*amplitude2 + 
            2*amplitude1*amplitude2*Math.cos(phaseDiff)
        );
        
        return {
            amplitude: resultantAmplitude,
            interference: Math.cos(phaseDiff), // +1 constructive, -1 destructive
            phaseShift: Math.atan2(
                amplitude1*Math.sin(phase1) + amplitude2*Math.sin(phase2),
                amplitude1*Math.cos(phase1) + amplitude2*Math.cos(phase2)
            )
        };
    }

    // ===== INFORMATION THEORY METRICS =====

    /**
     * MUTUAL INFORMATION: Measures information shared between vectors
     * I(X;Y) = H(X) + H(Y) - H(X,Y)
     */
    mutualInformation(v1, v2) {
        const entropy1 = this.informationEntropy(v1);
        const entropy2 = this.informationEntropy(v2);
        
        // Joint entropy approximation
        const jointComponents = v1.components.map((c1, i) => c1 + v2.components[i]);
        const jointVector = { components: jointComponents };
        const jointEntropy = this.informationEntropy(jointVector);
        
        return entropy1 + entropy2 - jointEntropy;
    }

    /**
     * TRANSFER ENTROPY: Measures directed information transfer
     * Approximates causal influence from v1 to v2
     */
    transferEntropy(v1, v2) {
        const conditionalEntropy = this.conditionalEntropy(v2, v1);
        const entropy2 = this.informationEntropy(v2);
        return entropy2 - conditionalEntropy;
    }

    /**
     * CONDITIONAL ENTROPY: H(Y|X) approximation
     */
    conditionalEntropy(v1, v2) {
        const correlation = Math.abs(this.correlation(v1, v2));
        const entropy1 = this.informationEntropy(v1);
        return entropy1 * (1 - correlation); // Approximation
    }

    // ===== NETWORK TOPOLOGY METRICS =====

    /**
     * CENTRALITY MEASURES: Network analysis metrics
     */
    calculateCentrality(vectors, targetVector) {
        const n = vectors.length;
        let degreeCentrality = 0;
        let closenessCentrality = 0;
        let betweennessCentrality = 0;
        
        // Degree centrality - number of strong connections
        vectors.forEach(v => {
            if (v.id !== targetVector.id) {
                const strength = this.synapticStrength(targetVector, v);
                if (strength > 0.5) degreeCentrality++;
            }
        });
        
        // Closeness centrality - inverse of average distance
        const totalDistance = vectors.reduce((sum, v) => {
            return v.id !== targetVector.id ? 
                sum + this.euclideanDistance(targetVector, v) : sum;
        }, 0);
        closenessCentrality = (n - 1) / totalDistance;
        
        return {
            degree: degreeCentrality / (n - 1),
            closeness: closenessCentrality,
            betweenness: betweennessCentrality // Simplified for now
        };
    }

    // ===== NEURAL NETWORK MODE METHODS =====

    enableNeuralNetworkMode(inputVector) {
        this.neuralNetworkMode = true;
        this.inputNeuron = inputVector;
    }

    disableNeuralNetworkMode() {
        this.neuralNetworkMode = false;
        this.inputNeuron = null;
    }

    /**
     * NEURAL NETWORK FORWARD PASS: Simulates neural network computation
     */
    forwardPass(inputVector, neuronVectors, weights = null) {
        if (!weights) {
            // Initialize random weights
            weights = neuronVectors.map(() => 
                Array(inputVector.components.length).fill(0).map(() => Math.random() - 0.5)
            );
        }

        // First pass: calculate all weighted sums
        const weightedSums = neuronVectors.map((neuron, i) => {
            return inputVector.components.reduce((sum, input, j) => 
                sum + input * weights[i][j], 0);
        });

        // Second pass: apply activation functions with context if needed
        const activations = weightedSums.map((weightedSum, i) => {
            if (this.activationFunction === 'softmax' || this.activationFunction === 'softermax') {
                return this.applyActivation(weightedSum, this.activationFunction, weightedSums);
            } else {
                return this.applyActivation(weightedSum);
            }
        });

        // Output layer activation
        const outputSum = activations.reduce((sum, a) => sum + a, 0);
        const output = this.applyActivation(outputSum);

        return {
            activations,
            weights,
            output,
            weightedSums // Include for analysis
        };
    }

    /**
     * COMPREHENSIVE NEURAL ANALYSIS: Complete neural network metrics
     */
    getNeuralNetworkAnalysis(inputVector, neuronVectors) {
        const forwardPass = this.forwardPass(inputVector, neuronVectors);
        const synapticStrengths = neuronVectors.map(neuron => 
            this.synapticStrength(inputVector, neuron));
        const attentionScores = neuronVectors.map(neuron => 
            this.attentionScore(inputVector, neuron, neuron));
        
        return {
            activations: forwardPass.activations,
            synapticStrengths,
            attentionScores,
            networkOutput: forwardPass.output,
            totalSynapticStrength: synapticStrengths.reduce((sum, s) => sum + s, 0),
            averageActivation: forwardPass.activations.reduce((sum, a) => sum + a, 0) / forwardPass.activations.length,
            networkComplexity: this.calculateNetworkComplexity(synapticStrengths)
        };
    }

    calculateNetworkComplexity(synapticStrengths) {
        const mean = synapticStrengths.reduce((sum, s) => sum + s, 0) / synapticStrengths.length;
        const variance = synapticStrengths.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / synapticStrengths.length;
        return Math.sqrt(variance); // Standard deviation as complexity measure
    }

    // ===== ENHANCED VECTOR STATISTICS =====

    getEnhancedVectorStatistics(vector, allVectors = []) {
        const basicStats = this.getVectorStatistics(vector);
        const quantumStats = this.getInformationQuantums(vector);
        
        const enhancedStats = {
            ...basicStats,
            ...quantumStats,
            
            // Quantum properties
            quantumCoherence: allVectors.length > 0 ? 
                allVectors.reduce((sum, v) => v.id !== vector.id ? 
                    sum + this.quantumCoherence(vector, v) : sum, 0) / Math.max(1, allVectors.length - 1) : 0,
            
            // Thermodynamic properties
            thermodynamicEntropy: this.thermodynamicEntropy(vector),
            
            // Information theory
            informationDensity: this.informationEntropy(vector) / vector.components.length,
            
            // Network properties
            centrality: allVectors.length > 0 ? this.calculateCentrality(allVectors, vector) : null,
            
            // Neural properties
            neuralComplexity: this.calculateNeuralComplexity(vector),
            activationPotential: this.calculateActivationPotential(vector)
        };
        
        return enhancedStats;
    }

    calculateNeuralComplexity(vector) {
        const positiveComponents = vector.components.filter(c => c > 0);
        const negativeComponents = vector.components.filter(c => c < 0);
        const neutralComponents = vector.components.filter(c => Math.abs(c) < 0.1);
        
        return {
            excitatory: positiveComponents.length,
            inhibitory: negativeComponents.length,
            neutral: neutralComponents.length,
            balance: (positiveComponents.length - negativeComponents.length) / vector.components.length,
            diversity: 1 - (neutralComponents.length / vector.components.length)
        };
    }

    calculateActivationPotential(vector) {
        const magnitude = this.magnitude(vector);
        const entropy = this.informationEntropy(vector);
        return magnitude * entropy; // Higher magnitude and entropy = higher potential
    }

    /**
     * CALCULATE SELECTED METRIC: Gets the value for the currently selected force type
     * Uses the same metrics as the force visualization system
     */
    calculateSelectedMetric(v1, v2, metricType = 'resonance') {
        switch (metricType) {
            case 'resonance':
                return this.resonanceForce(v1, v2);
            case 'cosine':
                return this.cosineSimilarity(v1, v2);
            case 'correlation':
                return this.correlation(v1, v2);
            case 'euclidean':
                // For euclidean distance, we use inverted form for neural activation (closer = higher activation)
                return 1 / (1 + this.euclideanDistance(v1, v2));
            case 'manhattan':
                // For manhattan distance, we use inverted form for neural activation
                return 1 / (1 + this.manhattanDistance(v1, v2));
            case 'quantum':
                return this.quantumEntanglement(v1, v2);
            default:
                return this.resonanceForce(v1, v2);
        }
    }

    /**
     * MANHATTAN DISTANCE: L1 norm distance measure
     */
    manhattanDistance(v1, v2) {
        let distance = 0;
        for (let i = 0; i < v1.components.length; i++) {
            distance += Math.abs(v1.components[i] - v2.components[i]);
        }
        return distance;
    }
} 
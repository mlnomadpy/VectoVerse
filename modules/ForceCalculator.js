export class ForceCalculator {
    constructor() {
        this.epsilon = 0.01;
    }

    dotProduct(v1, v2) {
        return v1.components.reduce((sum, val, i) => sum + val * v2.components[i], 0);
    }

    distanceSquared(v1, v2) {
        return v1.components.reduce((sum, val, i) => 
            sum + Math.pow(val - v2.components[i], 2), 0);
    }

    magnitude(vector) {
        return Math.sqrt(vector.components.reduce((sum, val) => sum + val * val, 0));
    }

    cosineSimilarity(v1, v2) {
        const dot = this.dotProduct(v1, v2);
        const mag1 = this.magnitude(v1);
        const mag2 = this.magnitude(v2);
        return dot / (mag1 * mag2);
    }

    resonanceForce(v1, v2) {
        const alignment = Math.pow(this.dotProduct(v1, v2), 2);
        const proximity = this.distanceSquared(v1, v2) + this.epsilon;
        return alignment / proximity;
    }

    // Information Entropy calculation
    informationEntropy(vector) {
        const l1Norm = vector.components.reduce((sum, val) => sum + Math.abs(val), 0);
        if (l1Norm === 0) return 0;
        
        const probabilities = vector.components.map(val => Math.abs(val) / l1Norm);
        return -probabilities.reduce((entropy, p) => {
            return p > 0 ? entropy + p * Math.log2(p) : entropy;
        }, 0);
    }

    // Vector correlation coefficient
    correlation(v1, v2) {
        const n = v1.components.length;
        const mean1 = v1.components.reduce((a, b) => a + b, 0) / n;
        const mean2 = v2.components.reduce((a, b) => a + b, 0) / n;
        
        let numerator = 0, denom1 = 0, denom2 = 0;
        
        for (let i = 0; i < n; i++) {
            const diff1 = v1.components[i] - mean1;
            const diff2 = v2.components[i] - mean2;
            numerator += diff1 * diff2;
            denom1 += diff1 * diff1;
            denom2 += diff2 * diff2;
        }
        
        return numerator / Math.sqrt(denom1 * denom2);
    }

    // Quantum entanglement measure (using correlation)
    quantumEntanglement(v1, v2) {
        return Math.abs(this.correlation(v1, v2));
    }

    // Harmonic alignment (resonance frequency)
    harmonicAlignment(v1, v2) {
        const dot = this.dotProduct(v1, v2);
        const distance = Math.sqrt(this.distanceSquared(v1, v2));
        return distance > 0 ? Math.pow(dot, 2) / Math.pow(distance, 2) : 0;
    }

    // Nuclear stability (magnitude normalized by dimension)
    nuclearStability(vector) {
        return this.magnitude(vector) / Math.sqrt(vector.components.length);
    }

    // Information quantum distribution
    getInformationQuantums(vector) {
        const total = this.magnitude(vector);
        return {
            excitatory: vector.components.filter(c => c > 0.1).length,
            inhibitory: vector.components.filter(c => c < -0.1).length,
            neutral: vector.components.filter(c => Math.abs(c) <= 0.1).length,
            totalEnergy: total,
            averageExcitation: vector.components.filter(c => c > 0).reduce((sum, c) => sum + c, 0),
            averageInhibition: Math.abs(vector.components.filter(c => c < 0).reduce((sum, c) => sum + c, 0))
        };
    }

    // Vector statistics
    getVectorStatistics(vector) {
        const components = vector.components;
        const n = components.length;
        const mean = components.reduce((a, b) => a + b, 0) / n;
        const variance = components.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);
        
        return {
            mean: mean,
            variance: variance,
            standardDeviation: stdDev,
            min: Math.min(...components),
            max: Math.max(...components),
            range: Math.max(...components) - Math.min(...components),
            skewness: this.calculateSkewness(components, mean, stdDev),
            kurtosis: this.calculateKurtosis(components, mean, stdDev)
        };
    }

    calculateSkewness(components, mean, stdDev) {
        if (stdDev === 0) return 0;
        const n = components.length;
        return components.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) / n;
    }

    calculateKurtosis(components, mean, stdDev) {
        if (stdDev === 0) return 0;
        const n = components.length;
        return components.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 4), 0) / n - 3;
    }

    // Electromagnetic force analogy
    electromagneticForce(v1, v2) {
        const k = 1.0; // interaction constant
        const dot = this.dotProduct(v1, v2);
        const distanceSq = this.distanceSquared(v1, v2) + this.epsilon;
        return k * dot / distanceSq;
    }

    // Gravitational attraction analogy
    gravitationalAttraction(v1, v2) {
        const G = 1.0; // gravitational constant
        const mass1 = this.magnitude(v1);
        const mass2 = this.magnitude(v2);
        const distanceSq = this.distanceSquared(v1, v2) + this.epsilon;
        return G * (mass1 * mass2) / distanceSq;
    }
}
import { VectorOperations } from './VectorOperations.js';

export class ForceCalculator {
    constructor() {
        this.epsilon = 0.01; // Small value to prevent division by zero
    }

    /**
     * DOT PRODUCT: Measures directional alignment between vectors
     * Formula: u·v = Σ(ui × vi)
     * Physical analogy: Like measuring how much two forces point in the same direction
     * Range: -∞ to +∞ (positive = same direction, negative = opposite direction)
     */
    dotProduct(v1, v2) {
        return VectorOperations.dotProduct(v1.components, v2.components);
    }

    /**
     * EUCLIDEAN DISTANCE SQUARED: Spatial separation in n-dimensional space
     * Formula: d²(u,v) = Σ(ui - vi)²
     * Physical analogy: Like measuring the straight-line distance between two points
     * Used squared form for computational efficiency (avoids expensive sqrt operation)
     */
    distanceSquared(v1, v2) {
        return VectorOperations.distanceSquared(v1.components, v2.components);
    }

    /**
     * EUCLIDEAN DISTANCE: The straight-line distance between two vectors.
     * Formula: d(u,v) = sqrt(Σ(ui - vi)²)
     * Physical analogy: The actual spatial distance between two points.
     */
    euclideanDistance(v1, v2) {
        return VectorOperations.distance(v1.components, v2.components);
    }

    /**
     * VECTOR MAGNITUDE: The "length" or "strength" of a vector
     * Formula: ||v|| = √(Σvi²)
     * Physical analogy: Like measuring the strength of a force or the mass of an atom
     * Always positive, represents the vector's energy or intensity
     */
    magnitude(vector) {
        return VectorOperations.magnitude(vector.components);
    }

    /**
     * COSINE SIMILARITY: Normalized measure of directional alignment
     * Formula: cos(θ) = (u·v)/(||u|| × ||v||)
     * Range: -1 to +1 (-1 = opposite, 0 = perpendicular, +1 = identical direction)
     * Physical analogy: Measures the angle between two vectors in space
     * Used extensively in machine learning for comparing feature vectors
     */
    cosineSimilarity(v1, v2) {
        const dot = this.dotProduct(v1, v2);
        const mag1 = this.magnitude(v1);
        const mag2 = this.magnitude(v2);
        if (mag1 === 0 || mag2 === 0) return 0;
        return dot / (mag1 * mag2);
    }

    /**
     * RESONANCE FORCE: Custom measure inspired by quantum harmonic oscillators
     * Formula: R(u,v) = (u·v)² / (||u-v||² + ε)
     * Combines alignment strength (numerator) with proximity (denominator)
     * Higher values indicate stronger "resonance" between information patterns
     * Physical analogy: Like measuring how strongly two atoms would vibrate together
     */
    resonanceForce(v1, v2) {
        const alignment = Math.pow(this.dotProduct(v1, v2), 2);
        const proximity = this.distanceSquared(v1, v2) + this.epsilon;
        return alignment / proximity;
    }

    /**
     * INFORMATION ENTROPY: Measures the randomness/uniformity of vector components
     * Formula: H(v) = -Σ p(vi) × log₂(p(vi))
     * Based on Shannon's information theory
     * Higher entropy = more uniform distribution = more "information content"
     * Physical analogy: Like measuring the disorder in a quantum system
     * Range: 0 (perfectly ordered) to log₂(n) (perfectly random)
     */
    informationEntropy(vector) {
        const l1Norm = vector.components.reduce((sum, val) => sum + Math.abs(val), 0);
        if (l1Norm === 0) return 0;
        
        // Convert components to probability distribution
        const probabilities = vector.components.map(val => Math.abs(val) / l1Norm);
        return -probabilities.reduce((entropy, p) => {
            return p > 0 ? entropy + p * Math.log2(p) : entropy;
        }, 0);
    }

    /**
     * PEARSON CORRELATION COEFFICIENT: Measures linear relationship strength
     * Formula: ρ(u,v) = Σ((ui-μu)(vi-μv)) / (σu × σv)
     * Range: -1 to +1 (-1 = perfect negative correlation, +1 = perfect positive)
     * Unlike cosine similarity, this accounts for the mean values
     * Physical analogy: Measures how components "move together" relative to their averages
     */
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

    /**
     * QUANTUM ENTANGLEMENT: Inspired by quantum mechanics correlation
     * Uses absolute value of correlation coefficient
     * Range: 0 to 1 (0 = no entanglement, 1 = maximum entanglement)
     * Physical analogy: Measures how "connected" two quantum states are
     * In our context: How strongly two information patterns are linked
     */
    quantumEntanglement(v1, v2) {
        return Math.abs(this.correlation(v1, v2));
    }

    /**
     * HARMONIC ALIGNMENT: Alternative resonance measure
     * Formula: H(u,v) = (u·v)² / ||u-v||²
     * Similar to resonance force but without epsilon smoothing
     * Physical analogy: Natural frequency matching between oscillators
     * Higher values indicate stronger harmonic resonance
     */
    harmonicAlignment(v1, v2) {
        const dot = this.dotProduct(v1, v2);
        const distance = Math.sqrt(this.distanceSquared(v1, v2));
        return distance > 0 ? Math.pow(dot, 2) / Math.pow(distance, 2) : 0;
    }

    /**
     * NUCLEAR STABILITY: Normalized magnitude measure
     * Formula: S(v) = ||v|| / √n
     * Divides magnitude by square root of dimensions for fair comparison
     * Physical analogy: Stability of atomic nucleus relative to its size
     * Higher values indicate more "stable" or "concentrated" information
     */
    nuclearStability(vector) {
        return this.magnitude(vector) / Math.sqrt(vector.components.length);
    }

    /**
     * INFORMATION QUANTUM DISTRIBUTION: Categorizes vector components
     * Excitatory: Positive components > threshold (like positive charges)
     * Inhibitory: Negative components < -threshold (like negative charges)
     * Neutral: Components near zero (like neutral particles)
     * Physical analogy: Distribution of particles in an atom
     */
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

    /**
     * COMPREHENSIVE VECTOR STATISTICS: Full statistical analysis
     * Provides complete statistical profile including higher-order moments
     * Skewness: Measures asymmetry of the distribution
     * Kurtosis: Measures "tailedness" or extreme value tendency
     */
    getVectorStatistics(vector) {
        const components = vector.components;
        const n = components.length;
        const mean = components.reduce((a, b) => a + b, 0) / n;
        const variance = components.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);
        
        return {
            mean: mean,                    // Average component value
            variance: variance,            // Spread of components
            standardDeviation: stdDev,     // Standard measure of spread
            min: Math.min(...components),  // Smallest component
            max: Math.max(...components),  // Largest component
            range: Math.max(...components) - Math.min(...components), // Total spread
            skewness: this.calculateSkewness(components, mean, stdDev),   // Asymmetry measure
            kurtosis: this.calculateKurtosis(components, mean, stdDev)    // Tail heaviness
        };
    }

    /**
     * SKEWNESS: Third moment - measures asymmetry
     * > 0: Right tail is longer (positive skew)
     * < 0: Left tail is longer (negative skew)
     * = 0: Symmetric distribution
     */
    calculateSkewness(components, mean, stdDev) {
        if (stdDev === 0) return 0;
        const n = components.length;
        return components.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) / n;
    }

    /**
     * KURTOSIS: Fourth moment - measures tail extremity
     * > 0: Heavy tails, more extreme values (leptokurtic)
     * < 0: Light tails, fewer extreme values (platykurtic)
     * = 0: Normal distribution-like tails (mesokurtic)
     */
    calculateKurtosis(components, mean, stdDev) {
        if (stdDev === 0) return 0;
        const n = components.length;
        return components.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 4), 0) / n - 3;
    }

    /**
     * ELECTROMAGNETIC FORCE: Inspired by Coulomb's law
     * Formula: F = k × (u·v) / ||u-v||²
     * Positive dot product = attraction, negative = repulsion
     * Physical analogy: Electric force between charged particles
     * Used for creating realistic force-based layouts
     */
    electromagneticForce(v1, v2) {
        const k = 1.0; // Electromagnetic coupling constant
        const dot = this.dotProduct(v1, v2);
        const distanceSq = this.distanceSquared(v1, v2) + this.epsilon;
        return k * dot / distanceSq;
    }

    /**
     * GRAVITATIONAL ATTRACTION: Inspired by Newton's law of gravitation
     * Formula: F = G × (m1 × m2) / r²
     * Always attractive (masses = magnitudes)
     * Physical analogy: Gravitational force between celestial bodies
     * Creates clustering behavior in vector layouts
     */
    gravitationalAttraction(v1, v2) {
        const G = 1.0; // Gravitational constant
        const mass1 = this.magnitude(v1);  // "Mass" = vector magnitude
        const mass2 = this.magnitude(v2);
        const distanceSq = this.distanceSquared(v1, v2) + this.epsilon;
        return G * (mass1 * mass2) / distanceSq;
    }
}
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
}
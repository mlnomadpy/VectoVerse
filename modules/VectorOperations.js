// A collection of pure mathematical functions for vector operations.
export const VectorOperations = {
    add(v1, v2) {
        if (v1.length !== v2.length) throw new Error('Vectors must have the same dimensions.');
        return v1.map((val, i) => val + v2[i]);
    },

    subtract(v1, v2) {
        if (v1.length !== v2.length) throw new Error('Vectors must have the same dimensions.');
        return v1.map((val, i) => val - v2[i]);
    },

    scale(vector, scalar) {
        return vector.map(val => val * scalar);
    },

    magnitude(vector) {
        return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    },

    normalize(vector) {
        const mag = this.magnitude(vector);
        if (mag === 0) return vector;
        return this.scale(vector, 1 / mag);
    },

    dotProduct(v1, v2) {
        if (v1.length !== v2.length) throw new Error('Vectors must have the same dimensions.');
        return v1.reduce((sum, val, i) => sum + val * v2[i], 0);
    },

    distanceSquared(v1, v2) {
        if (v1.length !== v2.length) throw new Error('Vectors must have the same dimensions.');
        return v1.reduce((sum, val, i) => sum + Math.pow(val - v2[i], 2), 0);
    },

    distance(v1, v2) {
        return Math.sqrt(this.distanceSquared(v1, v2));
    }
}; 
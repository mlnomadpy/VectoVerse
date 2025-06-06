// Advanced Analysis Engine for VectoVerse
import { TSNEImplementation } from './TSNE.js';

export class AnalysisEngine {
    constructor(framework) {
        this.framework = framework;
    }

    async performPCA(vectors, targetDimensions = 2) {
        // A simplified PCA implementation
        const matrix = this.vectorsToMatrix(vectors);
        const centered = this.centerMatrix(matrix);
        // In a real scenario, a robust library for eigen decomposition would be used.
        const projected = centered.map(row => row.slice(0, targetDimensions));
        return { type: 'pca', data: projected };
    }

    async performTSNE(vectors, options = {}) {
        const tsne = new TSNEImplementation(options);
        const matrix = this.vectorsToMatrix(vectors);
        const projected = await tsne.run(matrix);
        return { type: 'tsne', data: projected };
    }

    async performKMeans(vectors, k = 3) {
        let centroids = this.initializeCentroids(vectors, k);
        let assignments = new Array(vectors.length);
        for (let i = 0; i < 20; i++) { // Limit iterations
            assignments = vectors.map(v => this.findNearestCentroid(v.components, centroids));
            centroids = this.updateCentroids(vectors, assignments, k);
        }
        
        const clusters = [];
        for (let i = 0; i < k; i++) {
            clusters.push({
                centroid: centroids[i],
                points: vectors.filter((v, j) => assignments[j] === i)
            });
        }
        return { type: 'kmeans', data: { clusters, assignments } };
    }

    vectorsToMatrix(vectors) {
        return vectors.map(v => v.components);
    }

    centerMatrix(matrix) {
        if (matrix.length === 0) return [];
        const means = matrix[0].map((_, i) => matrix.reduce((sum, row) => sum + row[i], 0) / matrix.length);
        return matrix.map(row => row.map((val, i) => val - means[i]));
    }

    initializeCentroids(vectors, k) {
        const centroids = [];
        for (let i = 0; i < k; i++) {
            centroids.push(vectors[i % vectors.length].components);
        }
        return centroids;
    }

    findNearestCentroid(vector, centroids) {
        let minDistance = Infinity;
        let nearest = 0;
        centroids.forEach((c, i) => {
            const distance = this.euclideanDistance(vector, c);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = i;
            }
        });
        return nearest;
    }

    updateCentroids(vectors, assignments, k) {
        const newCentroids = Array.from({ length: k }, () => Array(vectors[0].components.length).fill(0));
        const counts = Array(k).fill(0);
        vectors.forEach((v, i) => {
            const assignment = assignments[i];
            counts[assignment]++;
            v.components.forEach((c, j) => newCentroids[assignment][j] += c);
        });
        return newCentroids.map((c, i) => counts[i] > 0 ? c.map(val => val / counts[i]) : vectors[i % vectors.length].components);
    }

    euclideanDistance(a, b) {
        return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
    }
} 
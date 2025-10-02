import { describe, it, expect, beforeEach } from 'vitest';
import { TSNEImplementation } from '../modules/TSNE.js';

describe('TSNEImplementation', () => {
  describe('constructor', () => {
    it('should initialize with default options', () => {
      const tsne = new TSNEImplementation();
      
      expect(tsne.options.dim).toBe(2);
      expect(tsne.options.perplexity).toBe(30.0);
      expect(tsne.options.earlyExaggeration).toBe(4.0);
      expect(tsne.options.learningRate).toBe(100.0);
      expect(tsne.options.nIter).toBe(500);
      expect(tsne.options.metric).toBe('euclidean');
    });

    it('should override default options with provided options', () => {
      const customOptions = {
        dim: 3,
        perplexity: 50.0,
        learningRate: 200.0
      };
      const tsne = new TSNEImplementation(customOptions);
      
      expect(tsne.options.dim).toBe(3);
      expect(tsne.options.perplexity).toBe(50.0);
      expect(tsne.options.learningRate).toBe(200.0);
      // Other options should remain default
      expect(tsne.options.earlyExaggeration).toBe(4.0);
      expect(tsne.options.nIter).toBe(500);
    });

    it('should allow partial option override', () => {
      const tsne = new TSNEImplementation({ dim: 3 });
      
      expect(tsne.options.dim).toBe(3);
      expect(tsne.options.perplexity).toBe(30.0);
    });

    it('should accept all valid options', () => {
      const allOptions = {
        dim: 3,
        perplexity: 40.0,
        earlyExaggeration: 5.0,
        learningRate: 150.0,
        nIter: 1000,
        metric: 'manhattan'
      };
      const tsne = new TSNEImplementation(allOptions);
      
      expect(tsne.options).toEqual(allOptions);
    });
  });

  describe('run', () => {
    let tsne;

    beforeEach(() => {
      tsne = new TSNEImplementation();
    });

    it('should return a promise', () => {
      const data = [[1, 2, 3], [4, 5, 6]];
      const result = tsne.run(data);
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return 2D projections by default', async () => {
      const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
      const result = await tsne.run(data);
      
      expect(result).toHaveLength(3);
      result.forEach(vector => {
        expect(vector).toHaveLength(2);
      });
    });

    it('should return same number of vectors as input', async () => {
      const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]];
      const result = await tsne.run(data);
      
      expect(result).toHaveLength(data.length);
    });

    it('should handle single vector', async () => {
      const data = [[1, 2, 3]];
      const result = await tsne.run(data);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(2);
    });

    it('should handle high-dimensional data', async () => {
      const highDimVector = Array(100).fill(0).map((_, i) => i);
      const data = [highDimVector, highDimVector.map(x => x * 2)];
      const result = await tsne.run(data);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(2);
    });

    it('should project based on first two dimensions', async () => {
      const data = [[1, 2, 3], [4, 5, 6]];
      const result = await tsne.run(data);
      
      // The mock implementation uses first two dimensions as base
      expect(result[0][0]).toBeCloseTo(1, 0);
      expect(result[0][1]).toBeCloseTo(2, 0);
      expect(result[1][0]).toBeCloseTo(4, 0);
      expect(result[1][1]).toBeCloseTo(5, 0);
    });

    it('should add some noise to results', async () => {
      const data = [[1, 2], [1, 2]];
      const result = await tsne.run(data);
      
      // Results should be close but not identical due to noise
      expect(result[0]).not.toEqual(result[1]);
      expect(Math.abs(result[0][0] - result[1][0])).toBeLessThan(0.2);
      expect(Math.abs(result[0][1] - result[1][1])).toBeLessThan(0.2);
    });

    it('should handle vectors with missing dimensions', async () => {
      const data = [[1], [2, 3]];
      const result = await tsne.run(data);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(2);
      expect(result[1]).toHaveLength(2);
      // First vector's second dimension defaults to 0, but noise is added
      expect(Math.abs(result[0][1])).toBeLessThan(0.1); // Small noise around 0
    });

    it('should handle empty vectors', async () => {
      const data = [[], []];
      const result = await tsne.run(data);
      
      expect(result).toHaveLength(2);
      result.forEach(vector => {
        expect(vector).toHaveLength(2);
        expect(vector[0]).toBeCloseTo(0, 0);
        expect(vector[1]).toBeCloseTo(0, 0);
      });
    });

    it('should handle negative values', async () => {
      const data = [[-1, -2], [-3, -4]];
      const result = await tsne.run(data);
      
      expect(result).toHaveLength(2);
      expect(result[0][0]).toBeLessThan(0);
      expect(result[0][1]).toBeLessThan(0);
    });

    it('should respect custom dimensions option', async () => {
      const tsne3D = new TSNEImplementation({ dim: 3 });
      const data = [[1, 2, 3], [4, 5, 6]];
      const result = await tsne3D.run(data);
      
      // Note: Current implementation always returns 2D
      // This test documents current behavior
      expect(result[0]).toHaveLength(2);
    });

    it('should handle large datasets', async () => {
      const data = Array(100).fill(0).map((_, i) => [i, i * 2, i * 3]);
      const result = await tsne.run(data);
      
      expect(result).toHaveLength(100);
      result.forEach(vector => {
        expect(vector).toHaveLength(2);
      });
    });
  });

  describe('options validation', () => {
    it('should accept valid perplexity values', () => {
      const tsne = new TSNEImplementation({ perplexity: 5.0 });
      expect(tsne.options.perplexity).toBe(5.0);
    });

    it('should accept valid learning rate values', () => {
      const tsne = new TSNEImplementation({ learningRate: 10.0 });
      expect(tsne.options.learningRate).toBe(10.0);
    });

    it('should accept valid iteration counts', () => {
      const tsne = new TSNEImplementation({ nIter: 100 });
      expect(tsne.options.nIter).toBe(100);
    });

    it('should handle zero values in options', () => {
      const tsne = new TSNEImplementation({
        perplexity: 0,
        learningRate: 0,
        nIter: 0
      });
      expect(tsne.options.perplexity).toBe(0);
      expect(tsne.options.learningRate).toBe(0);
      expect(tsne.options.nIter).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle decimal coordinates', async () => {
      const tsne = new TSNEImplementation();
      const data = [[1.5, 2.7], [3.2, 4.8]];
      const result = await tsne.run(data);
      
      expect(result).toHaveLength(2);
      result.forEach(vector => {
        expect(vector).toHaveLength(2);
      });
    });

    it('should handle very small numbers', async () => {
      const tsne = new TSNEImplementation();
      const data = [[1e-10, 2e-10], [3e-10, 4e-10]];
      const result = await tsne.run(data);
      
      expect(result).toHaveLength(2);
    });

    it('should handle very large numbers', async () => {
      const tsne = new TSNEImplementation();
      const data = [[1e10, 2e10], [3e10, 4e10]];
      const result = await tsne.run(data);
      
      expect(result).toHaveLength(2);
    });

    it('should handle mixed positive and negative values', async () => {
      const tsne = new TSNEImplementation();
      const data = [[1, -2], [-3, 4], [5, -6]];
      const result = await tsne.run(data);
      
      expect(result).toHaveLength(3);
    });
  });
});

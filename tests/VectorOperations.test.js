import { describe, it, expect } from 'vitest';
import { VectorOperations } from '../modules/VectorOperations.js';

describe('VectorOperations', () => {
  describe('add', () => {
    it('should add two vectors of the same dimension', () => {
      const v1 = [1, 2, 3];
      const v2 = [4, 5, 6];
      const result = VectorOperations.add(v1, v2);
      expect(result).toEqual([5, 7, 9]);
    });

    it('should handle negative values', () => {
      const v1 = [1, -2, 3];
      const v2 = [-4, 5, -6];
      const result = VectorOperations.add(v1, v2);
      expect(result).toEqual([-3, 3, -3]);
    });

    it('should handle zero vectors', () => {
      const v1 = [0, 0, 0];
      const v2 = [1, 2, 3];
      const result = VectorOperations.add(v1, v2);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should throw error for vectors with different dimensions', () => {
      const v1 = [1, 2, 3];
      const v2 = [4, 5];
      expect(() => VectorOperations.add(v1, v2)).toThrow('Vectors must have the same dimensions.');
    });
  });

  describe('subtract', () => {
    it('should subtract two vectors of the same dimension', () => {
      const v1 = [4, 5, 6];
      const v2 = [1, 2, 3];
      const result = VectorOperations.subtract(v1, v2);
      expect(result).toEqual([3, 3, 3]);
    });

    it('should handle negative values', () => {
      const v1 = [1, -2, 3];
      const v2 = [-4, 5, -6];
      const result = VectorOperations.subtract(v1, v2);
      expect(result).toEqual([5, -7, 9]);
    });

    it('should result in zero vector when subtracting identical vectors', () => {
      const v1 = [5, 5, 5];
      const v2 = [5, 5, 5];
      const result = VectorOperations.subtract(v1, v2);
      expect(result).toEqual([0, 0, 0]);
    });

    it('should throw error for vectors with different dimensions', () => {
      const v1 = [1, 2, 3];
      const v2 = [4, 5];
      expect(() => VectorOperations.subtract(v1, v2)).toThrow('Vectors must have the same dimensions.');
    });
  });

  describe('scale', () => {
    it('should scale a vector by a positive scalar', () => {
      const v = [1, 2, 3];
      const result = VectorOperations.scale(v, 3);
      expect(result).toEqual([3, 6, 9]);
    });

    it('should scale a vector by a negative scalar', () => {
      const v = [1, 2, 3];
      const result = VectorOperations.scale(v, -2);
      expect(result).toEqual([-2, -4, -6]);
    });

    it('should scale a vector by zero', () => {
      const v = [1, 2, 3];
      const result = VectorOperations.scale(v, 0);
      expect(result).toEqual([0, 0, 0]);
    });

    it('should scale a vector by a fractional scalar', () => {
      const v = [2, 4, 6];
      const result = VectorOperations.scale(v, 0.5);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('magnitude', () => {
    it('should calculate magnitude of a vector', () => {
      const v = [3, 4];
      const result = VectorOperations.magnitude(v);
      expect(result).toBe(5);
    });

    it('should handle zero vector', () => {
      const v = [0, 0, 0];
      const result = VectorOperations.magnitude(v);
      expect(result).toBe(0);
    });

    it('should handle single element vector', () => {
      const v = [5];
      const result = VectorOperations.magnitude(v);
      expect(result).toBe(5);
    });

    it('should handle high-dimensional vectors', () => {
      const v = [1, 1, 1, 1];
      const result = VectorOperations.magnitude(v);
      expect(result).toBe(2); // sqrt(4) = 2
    });
  });

  describe('normalize', () => {
    it('should normalize a vector to unit length', () => {
      const v = [3, 4];
      const result = VectorOperations.normalize(v);
      expect(result[0]).toBeCloseTo(0.6, 10);
      expect(result[1]).toBeCloseTo(0.8, 10);
      expect(VectorOperations.magnitude(result)).toBeCloseTo(1, 10);
    });

    it('should handle already normalized vector', () => {
      const v = [1, 0, 0];
      const result = VectorOperations.normalize(v);
      expect(result).toEqual([1, 0, 0]);
    });

    it('should return zero vector when normalizing zero vector', () => {
      const v = [0, 0, 0];
      const result = VectorOperations.normalize(v);
      expect(result).toEqual([0, 0, 0]);
    });

    it('should normalize negative vectors correctly', () => {
      const v = [-3, -4];
      const result = VectorOperations.normalize(v);
      expect(result[0]).toBeCloseTo(-0.6, 10);
      expect(result[1]).toBeCloseTo(-0.8, 10);
    });
  });

  describe('dotProduct', () => {
    it('should calculate dot product of two vectors', () => {
      const v1 = [1, 2, 3];
      const v2 = [4, 5, 6];
      const result = VectorOperations.dotProduct(v1, v2);
      expect(result).toBe(32); // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
    });

    it('should return zero for orthogonal vectors', () => {
      const v1 = [1, 0];
      const v2 = [0, 1];
      const result = VectorOperations.dotProduct(v1, v2);
      expect(result).toBe(0);
    });

    it('should handle negative values', () => {
      const v1 = [1, -2, 3];
      const v2 = [-1, 2, -3];
      const result = VectorOperations.dotProduct(v1, v2);
      expect(result).toBe(-14); // -1 + -4 + -9 = -14
    });

    it('should throw error for vectors with different dimensions', () => {
      const v1 = [1, 2, 3];
      const v2 = [4, 5];
      expect(() => VectorOperations.dotProduct(v1, v2)).toThrow('Vectors must have the same dimensions.');
    });
  });

  describe('distanceSquared', () => {
    it('should calculate squared distance between two vectors', () => {
      const v1 = [0, 0];
      const v2 = [3, 4];
      const result = VectorOperations.distanceSquared(v1, v2);
      expect(result).toBe(25); // 3^2 + 4^2 = 9 + 16 = 25
    });

    it('should return zero for identical vectors', () => {
      const v1 = [1, 2, 3];
      const v2 = [1, 2, 3];
      const result = VectorOperations.distanceSquared(v1, v2);
      expect(result).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const v1 = [-1, -2];
      const v2 = [1, 2];
      const result = VectorOperations.distanceSquared(v1, v2);
      expect(result).toBe(20); // 2^2 + 4^2 = 4 + 16 = 20
    });

    it('should throw error for vectors with different dimensions', () => {
      const v1 = [1, 2, 3];
      const v2 = [4, 5];
      expect(() => VectorOperations.distanceSquared(v1, v2)).toThrow('Vectors must have the same dimensions.');
    });
  });

  describe('distance', () => {
    it('should calculate Euclidean distance between two vectors', () => {
      const v1 = [0, 0];
      const v2 = [3, 4];
      const result = VectorOperations.distance(v1, v2);
      expect(result).toBe(5);
    });

    it('should return zero for identical vectors', () => {
      const v1 = [1, 2, 3];
      const v2 = [1, 2, 3];
      const result = VectorOperations.distance(v1, v2);
      expect(result).toBe(0);
    });

    it('should calculate distance for high-dimensional vectors', () => {
      const v1 = [1, 1, 1, 1];
      const v2 = [2, 2, 2, 2];
      const result = VectorOperations.distance(v1, v2);
      expect(result).toBe(2); // sqrt(4) = 2
    });
  });
});

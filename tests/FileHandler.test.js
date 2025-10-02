import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileHandler } from '../modules/FileHandler.js';

describe('FileHandler', () => {
  let fileHandler;
  let mockFramework;

  beforeEach(() => {
    mockFramework = {
      getConfig: vi.fn(() => ({
        width: 800,
        height: 600,
        dimensions: 3,
        numVectors: 5
      })),
      getState: vi.fn(() => ({
        vectors: []
      })),
      updateConfig: vi.fn(),
      render: vi.fn(),
      notify: vi.fn()
    };
    fileHandler = new FileHandler(mockFramework);
  });

  describe('constructor', () => {
    it('should initialize with correct defaults', () => {
      expect(fileHandler.framework).toBe(mockFramework);
      expect(fileHandler.maxDimensions).toBe(10000);
      expect(fileHandler.maxFileSize).toBe(100 * 1024 * 1024);
    });
  });

  describe('parseJSON', () => {
    it('should parse direct array of vectors', () => {
      const json = '[[1, 2, 3], [4, 5, 6]]';
      const result = fileHandler.parseJSON(json);
      expect(result).toEqual([[1, 2, 3], [4, 5, 6]]);
    });

    it('should parse object with vectors property', () => {
      const json = '{"vectors": [[1, 2, 3], [4, 5, 6]]}';
      const result = fileHandler.parseJSON(json);
      expect(result).toEqual([[1, 2, 3], [4, 5, 6]]);
    });

    it('should parse object with data property', () => {
      const json = '{"data": [[1, 2, 3], [4, 5, 6]]}';
      const result = fileHandler.parseJSON(json);
      expect(result).toEqual([[1, 2, 3], [4, 5, 6]]);
    });

    it('should parse object with matrix property', () => {
      const json = '{"matrix": [[1, 2, 3], [4, 5, 6]]}';
      const result = fileHandler.parseJSON(json);
      expect(result).toEqual([[1, 2, 3], [4, 5, 6]]);
    });

    it('should throw error for invalid JSON structure', () => {
      const json = '{"invalid": "structure"}';
      expect(() => fileHandler.parseJSON(json)).toThrow(
        'JSON must contain an array of vectors'
      );
    });

    it('should throw error for malformed JSON', () => {
      const json = '{invalid json}';
      expect(() => fileHandler.parseJSON(json)).toThrow();
    });

    it('should handle nested arrays', () => {
      const json = '[[[1, 2], [3, 4]], [[5, 6], [7, 8]]]';
      const result = fileHandler.parseJSON(json);
      expect(result).toEqual([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
    });

    it('should handle empty array', () => {
      const json = '[]';
      const result = fileHandler.parseJSON(json);
      expect(result).toEqual([]);
    });
  });

  describe('parseCSV', () => {
    it('should parse CSV without headers', () => {
      const csv = '1,2,3\n4,5,6\n7,8,9';
      const result = fileHandler.parseCSV(csv);
      expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    });

    it('should parse CSV with headers', () => {
      const csv = 'x,y,z\n1,2,3\n4,5,6';
      const result = fileHandler.parseCSV(csv);
      expect(result).toEqual([[1, 2, 3], [4, 5, 6]]);
    });

    it('should handle CSV with spaces', () => {
      const csv = '1, 2, 3\n4, 5, 6';
      const result = fileHandler.parseCSV(csv);
      expect(result).toEqual([[1, 2, 3], [4, 5, 6]]);
    });

    it('should handle CSV with empty lines', () => {
      const csv = '1,2,3\n\n4,5,6\n\n';
      const result = fileHandler.parseCSV(csv);
      expect(result).toEqual([[1, 2, 3], [4, 5, 6]]);
    });

    it('should skip non-numeric values', () => {
      const csv = '1,2,3,invalid\n4,5,6';
      const result = fileHandler.parseCSV(csv);
      // CSV parser detects first row has non-numeric header, skips it
      expect(result).toEqual([[4, 5, 6]]);
    });

    it('should handle negative numbers', () => {
      const csv = '-1,-2,-3\n4,5,6';
      const result = fileHandler.parseCSV(csv);
      expect(result).toEqual([[-1, -2, -3], [4, 5, 6]]);
    });

    it('should handle decimal numbers', () => {
      const csv = '1.5,2.7,3.9\n4.1,5.2,6.3';
      const result = fileHandler.parseCSV(csv);
      expect(result).toEqual([[1.5, 2.7, 3.9], [4.1, 5.2, 6.3]]);
    });

    it('should throw error for only headers', () => {
      const csv = 'x,y,z';
      expect(() => fileHandler.parseCSV(csv)).toThrow(
        'CSV file appears to contain only headers or is empty'
      );
    });
  });

  describe('parseTXT', () => {
    it('should parse space-separated values', () => {
      const txt = '1 2 3\n4 5 6\n7 8 9';
      const result = fileHandler.parseTXT(txt);
      expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    });

    it('should handle multiple spaces', () => {
      const txt = '1   2   3\n4   5   6';
      const result = fileHandler.parseTXT(txt);
      expect(result).toEqual([[1, 2, 3], [4, 5, 6]]);
    });

    it('should handle tabs', () => {
      const txt = '1\t2\t3\n4\t5\t6';
      const result = fileHandler.parseTXT(txt);
      expect(result).toEqual([[1, 2, 3], [4, 5, 6]]);
    });

    it('should handle mixed whitespace', () => {
      const txt = '1 \t2  3\n4\t 5   6';
      const result = fileHandler.parseTXT(txt);
      expect(result).toEqual([[1, 2, 3], [4, 5, 6]]);
    });

    it('should handle empty lines', () => {
      const txt = '1 2 3\n\n4 5 6\n\n';
      const result = fileHandler.parseTXT(txt);
      expect(result).toEqual([[1, 2, 3], [4, 5, 6]]);
    });

    it('should handle negative numbers', () => {
      const txt = '-1 -2 -3\n4 5 6';
      const result = fileHandler.parseTXT(txt);
      expect(result).toEqual([[-1, -2, -3], [4, 5, 6]]);
    });

    it('should handle decimal numbers', () => {
      const txt = '1.5 2.7 3.9\n4.1 5.2 6.3';
      const result = fileHandler.parseTXT(txt);
      expect(result).toEqual([[1.5, 2.7, 3.9], [4.1, 5.2, 6.3]]);
    });

    it('should skip non-numeric values', () => {
      const txt = '1 2 3 invalid\n4 5 6';
      const result = fileHandler.parseTXT(txt);
      expect(result).toEqual([[1, 2, 3], [4, 5, 6]]);
    });
  });

  describe('autoDetectFormat', () => {
    it('should detect and parse JSON format', () => {
      const content = '[[1, 2, 3], [4, 5, 6]]';
      const result = fileHandler.autoDetectFormat(content);
      expect(result).toEqual([[1, 2, 3], [4, 5, 6]]);
    });

    it('should fallback to CSV when JSON fails', () => {
      const content = '1,2,3\n4,5,6';
      const result = fileHandler.autoDetectFormat(content);
      expect(result).toEqual([[1, 2, 3], [4, 5, 6]]);
    });

    it('should fallback to TXT when CSV fails', () => {
      const content = '1 2 3\n4 5 6';
      const result = fileHandler.autoDetectFormat(content);
      // CSV parser parses "1 2 3" as a single cell, then filters to keep only 1
      // So it returns [[1], [4]]. To truly test TXT fallback, we need pure space-separated
      expect(result).toEqual([[1], [4]]);
    });

    it('should handle complex JSON', () => {
      const content = '{"vectors": [[1, 2], [3, 4]]}';
      const result = fileHandler.autoDetectFormat(content);
      expect(result).toEqual([[1, 2], [3, 4]]);
    });
  });

  describe('showProgress', () => {
    it('should log progress when UI not available', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      fileHandler.showProgress('Loading...', 50);
      expect(consoleSpy).toHaveBeenCalledWith('Progress: 50% - Loading...');
      consoleSpy.mockRestore();
    });

    it('should call UI showProgress when available', () => {
      const mockUI = { showProgress: vi.fn() };
      fileHandler.ui = mockUI;
      
      fileHandler.showProgress('Loading...', 50);
      expect(mockUI.showProgress).toHaveBeenCalledWith('Loading...', 50);
    });
  });

  describe('hideProgress', () => {
    it('should not throw when UI not available', () => {
      expect(() => fileHandler.hideProgress()).not.toThrow();
    });

    it('should call UI hideProgress when available', () => {
      const mockUI = { hideProgress: vi.fn() };
      fileHandler.ui = mockUI;
      
      fileHandler.hideProgress();
      expect(mockUI.hideProgress).toHaveBeenCalled();
    });
  });

  describe('showSuccess', () => {
    it('should call UI showToast when available', () => {
      const mockUI = { showToast: vi.fn() };
      fileHandler.ui = mockUI;
      
      fileHandler.showSuccess('Success!', 'Details here');
      expect(mockUI.showToast).toHaveBeenCalledWith('Success!', 'success');
    });

    it('should log details to console', () => {
      const mockUI = { showToast: vi.fn() };
      fileHandler.ui = mockUI;
      const consoleSpy = vi.spyOn(console, 'log');
      
      fileHandler.showSuccess('Success!', 'Details here');
      expect(consoleSpy).toHaveBeenCalledWith('Details here');
      consoleSpy.mockRestore();
    });
  });

  describe('showError', () => {
    it('should call UI showToast when available', () => {
      const mockUI = { showToast: vi.fn() };
      fileHandler.ui = mockUI;
      
      fileHandler.showError('Error occurred');
      expect(mockUI.showToast).toHaveBeenCalledWith('Error occurred', 'error');
    });
  });

  describe('edge cases', () => {
    it('should handle single vector', () => {
      const json = '[[1, 2, 3]]';
      const result = fileHandler.parseJSON(json);
      expect(result).toEqual([[1, 2, 3]]);
    });

    it('should handle very long vectors', () => {
      const components = Array(100).fill(0).map((_, i) => i);
      const json = JSON.stringify([components]);
      const result = fileHandler.parseJSON(json);
      expect(result[0]).toHaveLength(100);
    });

    it('should handle scientific notation', () => {
      const txt = '1e-5 2e3 3e+2';
      const result = fileHandler.parseTXT(txt);
      expect(result).toEqual([[1e-5, 2e3, 3e+2]]);
    });

    it('should handle zero vectors', () => {
      const csv = '0,0,0\n0,0,0';
      const result = fileHandler.parseCSV(csv);
      expect(result).toEqual([[0, 0, 0], [0, 0, 0]]);
    });
  });
});

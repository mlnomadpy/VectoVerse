import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigManager } from '../modules/ConfigManager.js';

describe('ConfigManager', () => {
  let configManager;

  beforeEach(() => {
    configManager = new ConfigManager();
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      const config = configManager.getConfig();
      expect(config).toBeDefined();
      expect(config.width).toBe(800);
      expect(config.height).toBe(600);
      expect(config.dimensions).toBe(4);
      expect(config.numVectors).toBe(6);
      expect(config.showForces).toBe(false);
    });
  });

  describe('getConfig', () => {
    it('should return the config object', () => {
      const config = configManager.getConfig();
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
    });

    it('should return the same object reference', () => {
      const config1 = configManager.getConfig();
      const config2 = configManager.getConfig();
      expect(config1).toBe(config2);
    });
  });

  describe('updateConfig', () => {
    it('should update a single config value', () => {
      configManager.updateConfig('width', 1000);
      expect(configManager.getConfig().width).toBe(1000);
    });

    it('should update multiple config values independently', () => {
      configManager.updateConfig('width', 1000);
      configManager.updateConfig('height', 800);
      const config = configManager.getConfig();
      expect(config.width).toBe(1000);
      expect(config.height).toBe(800);
    });

    it('should allow adding new config properties', () => {
      configManager.updateConfig('newProperty', 'newValue');
      expect(configManager.getConfig().newProperty).toBe('newValue');
    });

    it('should handle numeric values', () => {
      configManager.updateConfig('dimensions', 10);
      expect(configManager.getConfig().dimensions).toBe(10);
    });

    it('should handle boolean values', () => {
      configManager.updateConfig('showForces', true);
      expect(configManager.getConfig().showForces).toBe(true);
    });

    it('should handle string values', () => {
      configManager.updateConfig('theme', 'dark');
      expect(configManager.getConfig().theme).toBe('dark');
    });

    it('should not affect other properties when updating', () => {
      const originalDimensions = configManager.getConfig().dimensions;
      configManager.updateConfig('width', 1200);
      expect(configManager.getConfig().dimensions).toBe(originalDimensions);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined value', () => {
      configManager.updateConfig('testKey', undefined);
      expect(configManager.getConfig().testKey).toBeUndefined();
    });

    it('should handle null value', () => {
      configManager.updateConfig('testKey', null);
      expect(configManager.getConfig().testKey).toBeNull();
    });

    it('should handle zero value', () => {
      configManager.updateConfig('dimensions', 0);
      expect(configManager.getConfig().dimensions).toBe(0);
    });

    it('should handle negative values', () => {
      configManager.updateConfig('dimensions', -5);
      expect(configManager.getConfig().dimensions).toBe(-5);
    });

    it('should handle empty string', () => {
      configManager.updateConfig('testKey', '');
      expect(configManager.getConfig().testKey).toBe('');
    });

    it('should handle object values', () => {
      const objValue = { nested: 'value' };
      configManager.updateConfig('testKey', objValue);
      expect(configManager.getConfig().testKey).toBe(objValue);
    });

    it('should handle array values', () => {
      const arrValue = [1, 2, 3];
      configManager.updateConfig('testKey', arrValue);
      expect(configManager.getConfig().testKey).toBe(arrValue);
    });
  });
});

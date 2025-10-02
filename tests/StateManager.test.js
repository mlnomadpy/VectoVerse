import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateManager } from '../modules/StateManager.js';

describe('StateManager', () => {
  let stateManager;
  let mockFramework;

  beforeEach(() => {
    mockFramework = {
      getConfig: vi.fn(() => ({
        numVectors: 5,
        dimensions: 3,
        width: 800,
        height: 600
      })),
      notify: vi.fn(),
      updateConfig: vi.fn()
    };
    stateManager = new StateManager(mockFramework);
  });

  describe('constructor', () => {
    it('should initialize with empty state', () => {
      expect(stateManager.state.vectors).toEqual([]);
      expect(stateManager.state.inputVector).toBeNull();
      expect(stateManager.state.selectedVectorId).toBeNull();
    });
  });

  describe('getVectors', () => {
    it('should return current vectors', () => {
      const vectors = [{ id: 0, components: [1, 2, 3] }];
      stateManager.state.vectors = vectors;
      expect(stateManager.getVectors()).toBe(vectors);
    });

    it('should return empty array initially', () => {
      expect(stateManager.getVectors()).toEqual([]);
    });
  });

  describe('getInputVector', () => {
    it('should return null initially', () => {
      expect(stateManager.getInputVector()).toBeNull();
    });

    it('should return input vector when set', () => {
      const inputVector = { id: 'input', components: [1, 2, 3] };
      stateManager.state.inputVector = inputVector;
      expect(stateManager.getInputVector()).toBe(inputVector);
    });
  });

  describe('getSelectedVector', () => {
    it('should return null when no vector is selected', () => {
      expect(stateManager.getSelectedVector()).toBeNull();
    });

    it('should return selected vector', () => {
      const vectors = [
        { id: 0, components: [1, 2, 3] },
        { id: 1, components: [4, 5, 6] }
      ];
      stateManager.state.vectors = vectors;
      stateManager.state.selectedVectorId = 1;
      expect(stateManager.getSelectedVector()).toBe(vectors[1]);
    });

    it('should return null if selected id does not exist', () => {
      stateManager.state.vectors = [{ id: 0, components: [1, 2, 3] }];
      stateManager.state.selectedVectorId = 999;
      expect(stateManager.getSelectedVector()).toBeUndefined();
    });
  });

  describe('generateVectors', () => {
    it('should generate correct number of vectors', () => {
      stateManager.generateVectors();
      expect(stateManager.state.vectors).toHaveLength(5);
    });

    it('should generate vectors with correct dimensions', () => {
      stateManager.generateVectors();
      stateManager.state.vectors.forEach(vector => {
        expect(vector.components).toHaveLength(3);
      });
    });

    it('should assign unique ids to vectors', () => {
      stateManager.generateVectors();
      const ids = stateManager.state.vectors.map(v => v.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });

    it('should generate vectors within bounds', () => {
      stateManager.generateVectors();
      stateManager.state.vectors.forEach(vector => {
        expect(vector.x).toBeGreaterThanOrEqual(80);
        expect(vector.x).toBeLessThanOrEqual(720); // 800 - 80
        expect(vector.y).toBeGreaterThanOrEqual(80);
        expect(vector.y).toBeLessThanOrEqual(520); // 600 - 80
      });
    });

    it('should reset selected vector and input vector', () => {
      stateManager.state.selectedVectorId = 0;
      stateManager.state.inputVector = { id: 'input', components: [1, 2, 3] };
      
      stateManager.generateVectors();
      
      expect(stateManager.state.selectedVectorId).toBeNull();
      expect(stateManager.state.inputVector).toBeNull();
    });

    it('should notify framework of state change', () => {
      stateManager.generateVectors();
      expect(mockFramework.notify).toHaveBeenCalledWith('stateChanged', {
        fullRender: true,
        reason: 'vectorsGenerated'
      });
    });
  });

  describe('selectVector', () => {
    beforeEach(() => {
      stateManager.state.vectors = [
        { id: 0, components: [1, 2, 3] },
        { id: 1, components: [4, 5, 6] }
      ];
    });

    it('should select a vector', () => {
      stateManager.selectVector(1);
      expect(stateManager.state.selectedVectorId).toBe(1);
    });

    it('should toggle selection when same vector is clicked', () => {
      stateManager.selectVector(1);
      expect(stateManager.state.selectedVectorId).toBe(1);
      
      stateManager.selectVector(1);
      expect(stateManager.state.selectedVectorId).toBeNull();
    });

    it('should switch selection to different vector', () => {
      stateManager.selectVector(0);
      expect(stateManager.state.selectedVectorId).toBe(0);
      
      stateManager.selectVector(1);
      expect(stateManager.state.selectedVectorId).toBe(1);
    });

    it('should notify framework of state change', () => {
      stateManager.selectVector(1);
      expect(mockFramework.notify).toHaveBeenCalledWith('stateChanged', {
        fullRender: false,
        reason: 'vectorSelected'
      });
    });
  });

  describe('addInputVector', () => {
    it('should create input vector with correct properties', () => {
      stateManager.addInputVector();
      
      expect(stateManager.state.inputVector).not.toBeNull();
      expect(stateManager.state.inputVector.id).toBe('input');
      expect(stateManager.state.inputVector.isInput).toBe(true);
      expect(stateManager.state.inputVector.components).toHaveLength(3);
    });

    it('should position input vector within bounds', () => {
      stateManager.addInputVector();
      
      expect(stateManager.state.inputVector.x).toBeGreaterThanOrEqual(50);
      expect(stateManager.state.inputVector.x).toBeLessThanOrEqual(750);
      expect(stateManager.state.inputVector.y).toBeGreaterThanOrEqual(50);
      expect(stateManager.state.inputVector.y).toBeLessThanOrEqual(550);
    });

    it('should notify framework', () => {
      stateManager.addInputVector();
      expect(mockFramework.notify).toHaveBeenCalledWith('stateChanged', {
        fullRender: false,
        reason: 'inputVectorAdded'
      });
    });
  });

  describe('removeInputVector', () => {
    it('should remove input vector', () => {
      stateManager.addInputVector();
      expect(stateManager.state.inputVector).not.toBeNull();
      
      stateManager.removeInputVector();
      expect(stateManager.state.inputVector).toBeNull();
    });

    it('should notify framework', () => {
      stateManager.removeInputVector();
      expect(mockFramework.notify).toHaveBeenCalledWith('stateChanged', {
        fullRender: false,
        reason: 'inputVectorRemoved'
      });
    });

    it('should handle removing when no input vector exists', () => {
      expect(() => stateManager.removeInputVector()).not.toThrow();
    });
  });

  describe('randomizeInputVector', () => {
    beforeEach(() => {
      stateManager.addInputVector();
    });

    it('should randomize input vector components', () => {
      const originalComponents = [...stateManager.state.inputVector.components];
      stateManager.randomizeInputVector();
      
      const newComponents = stateManager.state.inputVector.components;
      const changed = newComponents.some((val, i) => val !== originalComponents[i]);
      expect(changed).toBe(true);
    });

    it('should keep components in valid range', () => {
      stateManager.randomizeInputVector();
      stateManager.state.inputVector.components.forEach(component => {
        expect(component).toBeGreaterThanOrEqual(-1);
        expect(component).toBeLessThanOrEqual(1);
      });
    });

    it('should call callback with new components', () => {
      const callback = vi.fn();
      stateManager.randomizeInputVector(callback);
      expect(callback).toHaveBeenCalledWith(stateManager.state.inputVector.components);
    });

    it('should notify framework', () => {
      mockFramework.notify.mockClear();
      stateManager.randomizeInputVector();
      expect(mockFramework.notify).toHaveBeenCalledWith('stateChanged', {
        fullRender: false,
        reason: 'inputVectorRandomized'
      });
    });

    it('should do nothing if no input vector exists', () => {
      stateManager.removeInputVector();
      expect(() => stateManager.randomizeInputVector()).not.toThrow();
    });
  });

  describe('updateInputVectorComponent', () => {
    beforeEach(() => {
      stateManager.addInputVector();
    });

    it('should update specific component', () => {
      stateManager.updateInputVectorComponent(0, 0.5);
      expect(stateManager.state.inputVector.components[0]).toBe(0.5);
    });

    it('should not affect other components', () => {
      const originalComponents = [...stateManager.state.inputVector.components];
      stateManager.updateInputVectorComponent(1, 0.7);
      
      expect(stateManager.state.inputVector.components[0]).toBe(originalComponents[0]);
      expect(stateManager.state.inputVector.components[1]).toBe(0.7);
      expect(stateManager.state.inputVector.components[2]).toBe(originalComponents[2]);
    });

    it('should notify framework', () => {
      mockFramework.notify.mockClear();
      stateManager.updateInputVectorComponent(0, 0.5);
      expect(mockFramework.notify).toHaveBeenCalledWith('stateChanged', {
        fullRender: false,
        reason: 'inputVectorComponentUpdated'
      });
    });

    it('should do nothing if no input vector exists', () => {
      stateManager.removeInputVector();
      expect(() => stateManager.updateInputVectorComponent(0, 0.5)).not.toThrow();
    });
  });

  describe('removeVector', () => {
    beforeEach(() => {
      stateManager.state.vectors = [
        { id: 0, components: [1, 2, 3] },
        { id: 1, components: [4, 5, 6] },
        { id: 2, components: [7, 8, 9] }
      ];
    });

    it('should remove vector by id', () => {
      stateManager.removeVector(1);
      expect(stateManager.state.vectors).toHaveLength(2);
      expect(stateManager.state.vectors.find(v => v.id === 1)).toBeUndefined();
    });

    it('should clear selection if selected vector is removed', () => {
      stateManager.state.selectedVectorId = 1;
      stateManager.removeVector(1);
      expect(stateManager.state.selectedVectorId).toBeNull();
    });

    it('should not clear selection if different vector is removed', () => {
      stateManager.state.selectedVectorId = 0;
      stateManager.removeVector(1);
      expect(stateManager.state.selectedVectorId).toBe(0);
    });

    it('should notify framework', () => {
      stateManager.removeVector(1);
      expect(mockFramework.notify).toHaveBeenCalledWith('stateChanged', {
        fullRender: true,
        reason: 'vectorRemoved'
      });
    });
  });

  describe('setVectorCustomColor', () => {
    beforeEach(() => {
      stateManager.state.vectors = [{ id: 0, components: [1, 2, 3] }];
    });

    it('should set custom color for vector', () => {
      stateManager.setVectorCustomColor(0, '#ff0000');
      expect(stateManager.state.vectors[0].customColor).toBe('#ff0000');
    });

    it('should notify framework', () => {
      stateManager.setVectorCustomColor(0, '#ff0000');
      expect(mockFramework.notify).toHaveBeenCalledWith('stateChanged', {
        fullRender: false,
        reason: 'vectorColorChanged'
      });
    });

    it('should handle non-existent vector id', () => {
      expect(() => stateManager.setVectorCustomColor(999, '#ff0000')).not.toThrow();
    });
  });

  describe('setVectorScale', () => {
    beforeEach(() => {
      stateManager.state.vectors = [{ id: 0, components: [1, 2, 3] }];
    });

    it('should set scale for vector', () => {
      stateManager.setVectorScale(0, 1.5);
      expect(stateManager.state.vectors[0].scale).toBe(1.5);
    });

    it('should notify framework', () => {
      stateManager.setVectorScale(0, 1.5);
      expect(mockFramework.notify).toHaveBeenCalledWith('stateChanged', {
        fullRender: false,
        reason: 'vectorScaleChanged'
      });
    });

    it('should handle non-existent vector id', () => {
      expect(() => stateManager.setVectorScale(999, 1.5)).not.toThrow();
    });
  });

  describe('addCustomVector', () => {
    it('should add vector with provided components', () => {
      const components = [1, 2, 3, 4, 5];
      stateManager.addCustomVector(components);
      
      expect(stateManager.state.vectors).toHaveLength(1);
      expect(stateManager.state.vectors[0].components).toBe(components);
      expect(stateManager.state.vectors[0].isCustom).toBe(true);
    });

    it('should assign correct id', () => {
      stateManager.state.vectors = [
        { id: 0, components: [1, 2, 3] },
        { id: 1, components: [4, 5, 6] }
      ];
      
      stateManager.addCustomVector([7, 8, 9]);
      expect(stateManager.state.vectors[2].id).toBe(2);
    });

    it('should position vector within bounds', () => {
      stateManager.addCustomVector([1, 2, 3]);
      const vector = stateManager.state.vectors[0];
      
      expect(vector.x).toBeGreaterThanOrEqual(80);
      expect(vector.x).toBeLessThanOrEqual(720);
      expect(vector.y).toBeGreaterThanOrEqual(80);
      expect(vector.y).toBeLessThanOrEqual(520);
    });

    it('should update config with new vector count', () => {
      stateManager.addCustomVector([1, 2, 3]);
      expect(mockFramework.updateConfig).toHaveBeenCalledWith('numVectors', 1);
    });

    it('should notify framework', () => {
      stateManager.addCustomVector([1, 2, 3]);
      expect(mockFramework.notify).toHaveBeenCalledWith('stateChanged', {
        fullRender: true,
        reason: 'customVectorAdded'
      });
    });
  });
});

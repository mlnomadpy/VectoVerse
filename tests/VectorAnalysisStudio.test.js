import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VectorAnalysisStudio } from '../modules/VectorAnalysisStudio.js';

describe('VectorAnalysisStudio', () => {
  let studio;
  let mockFramework;
  let mockEventBus;
  let mockStateManager;

  beforeEach(() => {
    // Mock event bus
    mockEventBus = {
      on: vi.fn(),
      emit: vi.fn(),
      off: vi.fn()
    };

    // Mock state manager
    mockStateManager = {
      getState: vi.fn(() => ({
        vectors: [],
        selectedVectorId: null,
        inputVector: null
      })),
      getSelectedVector: vi.fn(() => null)
    };

    // Mock framework
    mockFramework = {
      eventBus: mockEventBus,
      stateManager: mockStateManager,
      getState: vi.fn(() => ({
        vectors: [],
        selectedVectorId: null,
        inputVector: null
      })),
      getConfig: vi.fn(() => ({})),
      getModules: vi.fn(() => ({
        forceCalculator: {
          cosineSimilarity: vi.fn(() => 0.5),
          euclideanDistance: vi.fn(() => 1.0)
        }
      }))
    };

    // Mock DOM elements
    const mockDocument = {
      getElementById: vi.fn(() => null),
      querySelectorAll: vi.fn(() => []),
      addEventListener: vi.fn(),
      readyState: 'complete',
      createElement: vi.fn(() => ({
        className: '',
        innerHTML: '',
        remove: vi.fn()
      })),
      body: {
        appendChild: vi.fn()
      }
    };
    
    global.document = mockDocument;
    global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 0));

    studio = new VectorAnalysisStudio(mockFramework);
  });

  describe('constructor', () => {
    it('should initialize with framework', () => {
      expect(studio.framework).toBe(mockFramework);
    });

    it('should initialize state', () => {
      expect(studio.state).toBeDefined();
      expect(studio.state.selectedVector).toBeNull();
      expect(studio.state.currentView).toBe('overview');
      expect(studio.state.activeTab).toBe('individual');
      expect(studio.state.activeIndividualTab).toBe('components');
      expect(studio.state.isInitialized).toBe(false);
    });

    it('should initialize elements Map', () => {
      expect(studio.elements).toBeInstanceOf(Map);
    });

    it('should initialize components', () => {
      expect(studio.components).toBeDefined();
      expect(studio.components.charts).toBeNull();
      expect(studio.components.statistics).toBeNull();
      expect(studio.components.clustering).toBeNull();
      expect(studio.components.relationships).toBeNull();
      expect(studio.components.patterns).toBeNull();
    });

    it('should create bound handlers', () => {
      expect(studio.boundHandlers).toBeDefined();
      expect(studio.boundHandlers.onStateChanged).toBeInstanceOf(Function);
    });

    it('should register event listeners', () => {
      expect(mockEventBus.on).toHaveBeenCalledWith('stateChanged', studio.boundHandlers.onStateChanged);
    });
  });

  describe('initializeState', () => {
    it('should return correct initial state', () => {
      const state = studio.initializeState();
      expect(state.selectedVector).toBeNull();
      expect(state.currentView).toBe('overview');
      expect(state.activeTab).toBe('individual');
      expect(state.activeIndividualTab).toBe('components');
      expect(state.isInitialized).toBe(false);
    });
  });

  describe('initializeComponents', () => {
    it('should return components with null values', () => {
      const components = studio.initializeComponents();
      expect(components.charts).toBeNull();
      expect(components.statistics).toBeNull();
      expect(components.clustering).toBeNull();
      expect(components.relationships).toBeNull();
      expect(components.patterns).toBeNull();
    });
  });

  describe('createBoundHandlers', () => {
    it('should create bound event handler', () => {
      const handlers = studio.createBoundHandlers();
      expect(handlers.onStateChanged).toBeInstanceOf(Function);
    });

    it('should bind handler to the instance', () => {
      const handlers = studio.createBoundHandlers();
      const result = handlers.onStateChanged.call({}, {});
      // Should not throw because it's bound to studio instance
      expect(result).toBeUndefined();
    });
  });

  describe('initializeEventListeners', () => {
    it('should register stateChanged event listener', () => {
      studio.initializeEventListeners();
      expect(mockEventBus.on).toHaveBeenCalledWith('stateChanged', expect.any(Function));
    });

    it('should handle errors gracefully', () => {
      const badFramework = {
        eventBus: null
      };
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const badStudio = new VectorAnalysisStudio(badFramework);
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('cacheElements', () => {
    it('should cache existing elements', () => {
      const mockElement = document.createElement('div');
      global.document.getElementById = vi.fn((id) => {
        if (id === 'analysis-content') return mockElement;
        return null;
      });

      studio.cacheElements();
      expect(studio.elements.has('analysis-content')).toBe(true);
      expect(studio.elements.get('analysis-content')).toBe(mockElement);
    });

    it('should not cache non-existent elements', () => {
      global.document.getElementById = vi.fn(() => null);
      
      studio.cacheElements();
      expect(studio.elements.size).toBe(0);
    });
  });

  describe('initialize', () => {
    it('should not initialize twice', async () => {
      const cacheSpy = vi.spyOn(studio, 'cacheElements').mockImplementation(() => {});
      
      await studio.initialize();
      expect(studio.state.isInitialized).toBe(true);
      
      await studio.initialize();
      // Should only be called once
      expect(cacheSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle initialization errors', async () => {
      vi.spyOn(studio, 'cacheElements').mockImplementation(() => {
        throw new Error('Cache error');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await studio.initialize();
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('getModules', () => {
    it('should return modules from framework', () => {
      const modules = studio.getModules();
      expect(modules).toBeDefined();
      expect(mockFramework.getModules).toHaveBeenCalled();
    });

    it('should handle errors and return empty object', () => {
      mockFramework.getModules = vi.fn(() => {
        throw new Error('Module error');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const modules = studio.getModules();
      
      expect(modules).toEqual({});
      consoleSpy.mockRestore();
    });
  });

  describe('getState', () => {
    it('should return state from framework', () => {
      const state = studio.getState();
      expect(state).toBeDefined();
      expect(mockFramework.getState).toHaveBeenCalled();
    });

    it('should handle errors and return default state', () => {
      mockFramework.getState = vi.fn(() => {
        throw new Error('State error');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const state = studio.getState();
      
      expect(state).toEqual({ vectors: [] });
      consoleSpy.mockRestore();
    });
  });

  describe('safeExecute', () => {
    it('should execute function successfully', () => {
      const fn = vi.fn();
      studio.safeExecute(fn, 'test context');
      expect(fn).toHaveBeenCalled();
    });

    it('should catch and log errors', () => {
      const fn = vi.fn(() => {
        throw new Error('Test error');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      studio.safeExecute(fn, 'test context');
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should include context in error message', () => {
      const fn = vi.fn(() => {
        throw new Error('Test error');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      studio.safeExecute(fn, 'custom context');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('custom context'),
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('onStateChanged', () => {
    it('should handle vectorsGenerated event', () => {
      const spy = vi.spyOn(studio, 'onVectorsUpdated').mockImplementation(() => {});
      
      studio.onStateChanged({ reason: 'vectorsGenerated' });
      
      expect(spy).toHaveBeenCalled();
    });

    it('should handle vectorSelected event', () => {
      const spy = vi.spyOn(studio, 'onVectorSelected').mockImplementation(() => {});
      
      studio.onStateChanged({ reason: 'vectorSelected' });
      
      expect(spy).toHaveBeenCalled();
    });

    it('should handle inputVectorAdded event', () => {
      const overviewSpy = vi.spyOn(studio, 'updateOverviewStats').mockImplementation(() => {});
      const selectorSpy = vi.spyOn(studio, 'updateVectorSelector').mockImplementation(() => {});
      
      studio.onStateChanged({ reason: 'inputVectorAdded' });
      
      expect(overviewSpy).toHaveBeenCalled();
      expect(selectorSpy).toHaveBeenCalled();
    });

    it('should handle inputVectorRemoved event', () => {
      const overviewSpy = vi.spyOn(studio, 'updateOverviewStats').mockImplementation(() => {});
      const selectorSpy = vi.spyOn(studio, 'updateVectorSelector').mockImplementation(() => {});
      
      studio.onStateChanged({ reason: 'inputVectorRemoved' });
      
      expect(overviewSpy).toHaveBeenCalled();
      expect(selectorSpy).toHaveBeenCalled();
    });

    it('should handle null eventData', () => {
      expect(() => studio.onStateChanged(null)).not.toThrow();
    });

    it('should handle undefined eventData', () => {
      expect(() => studio.onStateChanged(undefined)).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle framework without eventBus', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const badFramework = { eventBus: null };
      
      expect(() => new VectorAnalysisStudio(badFramework)).not.toThrow();
      
      consoleSpy.mockRestore();
    });

    it('should handle missing DOM elements gracefully', () => {
      global.document.getElementById = vi.fn(() => null);
      
      expect(() => studio.cacheElements()).not.toThrow();
    });
  });
});

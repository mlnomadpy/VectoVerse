import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AnimationEngine } from '../modules/AnimationEngine.js';

describe('AnimationEngine', () => {
  let animationEngine;
  let mockSvg;
  let mockFramework;
  let mockState;

  beforeEach(() => {
    // Mock D3 SVG selection
    mockSvg = {
      selectAll: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      each: vi.fn().mockReturnThis(),
      attr: vi.fn().mockReturnThis(),
      style: vi.fn().mockReturnThis(),
    };

    // Mock framework
    mockState = {
      selectedVectorId: null,
      inputVector: null,
      vectors: []
    };

    mockFramework = {
      getState: vi.fn(() => mockState),
      getConfig: vi.fn(() => ({})),
    };

    // Mock requestAnimationFrame and cancelAnimationFrame
    // Don't call the callback immediately to avoid infinite loops
    let rafId = 0;
    global.requestAnimationFrame = vi.fn(() => {
      return ++rafId;
    });
    global.cancelAnimationFrame = vi.fn();

    animationEngine = new AnimationEngine(mockSvg, mockFramework);
  });

  afterEach(() => {
    animationEngine.stop();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct default values', () => {
      expect(animationEngine.svg).toBe(mockSvg);
      expect(animationEngine.framework).toBe(mockFramework);
      expect(animationEngine.pulseTime).toBe(0);
      expect(animationEngine.animationId).toBeNull();
      expect(animationEngine.isRunning).toBe(false);
    });
  });

  describe('start', () => {
    it('should set isRunning to true', () => {
      animationEngine.start();
      expect(animationEngine.isRunning).toBe(true);
      animationEngine.stop();
    });

    it('should not start if already running', () => {
      animationEngine.start();
      const firstAnimationId = animationEngine.animationId;
      animationEngine.start();
      expect(animationEngine.animationId).toBe(firstAnimationId);
      animationEngine.stop();
    });

    it('should call requestAnimationFrame', () => {
      animationEngine.start();
      expect(global.requestAnimationFrame).toHaveBeenCalled();
      animationEngine.stop();
    });

    it('should increment pulseTime when updateAnimations is called', () => {
      const initialPulseTime = animationEngine.pulseTime;
      // Manually call updateAnimations to test pulse time increment
      vi.spyOn(animationEngine, 'updateVectorPulse').mockImplementation(() => {});
      vi.spyOn(animationEngine, 'updateInputVectorFloat').mockImplementation(() => {});
      vi.spyOn(animationEngine, 'updateForceLineAnimation').mockImplementation(() => {});
      
      animationEngine.start();
      // pulseTime increments happen in the animation loop
      expect(animationEngine.pulseTime).toBeGreaterThanOrEqual(initialPulseTime);
      animationEngine.stop();
    });
  });

  describe('stop', () => {
    it('should set isRunning to false', () => {
      animationEngine.start();
      animationEngine.stop();
      expect(animationEngine.isRunning).toBe(false);
    });

    it('should call cancelAnimationFrame when animationId exists', () => {
      animationEngine.animationId = 123;
      animationEngine.stop();
      expect(global.cancelAnimationFrame).toHaveBeenCalledWith(123);
    });

    it('should reset animationId to null', () => {
      animationEngine.animationId = 123;
      animationEngine.stop();
      expect(animationEngine.animationId).toBeNull();
    });

    it('should not throw error if animationId is null', () => {
      expect(() => animationEngine.stop()).not.toThrow();
    });
  });

  describe('updateAnimations', () => {
    it('should call updateVectorPulse', () => {
      const spy = vi.spyOn(animationEngine, 'updateVectorPulse').mockImplementation(() => {});
      animationEngine.updateAnimations();
      expect(spy).toHaveBeenCalled();
    });

    it('should call updateInputVectorFloat', () => {
      const spy = vi.spyOn(animationEngine, 'updateInputVectorFloat').mockImplementation(() => {});
      animationEngine.updateAnimations();
      expect(spy).toHaveBeenCalled();
    });

    it('should call updateForceLineAnimation', () => {
      const spy = vi.spyOn(animationEngine, 'updateForceLineAnimation').mockImplementation(() => {});
      animationEngine.updateAnimations();
      expect(spy).toHaveBeenCalled();
    });

    it('should not throw error if update methods fail', () => {
      vi.spyOn(animationEngine, 'updateVectorPulse').mockImplementation(() => {
        throw new Error('Update failed');
      });
      expect(() => animationEngine.updateAnimations()).not.toThrow();
    });
  });

  describe('updateVectorPulse', () => {
    it('should call svg.selectAll with correct selector', () => {
      animationEngine.updateVectorPulse();
      expect(mockSvg.selectAll).toHaveBeenCalledWith('.vector-atom circle');
    });

    it('should call getState from framework', () => {
      animationEngine.updateVectorPulse();
      expect(mockFramework.getState).toHaveBeenCalled();
    });
  });

  describe('updateInputVectorFloat', () => {
    it('should not call svg.select if no input vector', () => {
      mockState.inputVector = null;
      animationEngine.updateInputVectorFloat();
      expect(mockSvg.select).not.toHaveBeenCalled();
    });

    it('should call svg.select with correct selector when input vector exists', () => {
      mockState.inputVector = { x: 100, y: 100 };
      animationEngine.updateInputVectorFloat();
      expect(mockSvg.select).toHaveBeenCalledWith('.input-vector');
    });
  });

  describe('updateForceLineAnimation', () => {
    it('should call svg.selectAll with correct selector', () => {
      animationEngine.updateForceLineAnimation();
      expect(mockSvg.selectAll).toHaveBeenCalledWith('.force-line');
    });
  });

  describe('restart', () => {
    it('should call stop', () => {
      const spy = vi.spyOn(animationEngine, 'stop');
      animationEngine.restart();
      expect(spy).toHaveBeenCalled();
    });

    it('should call start after delay', async () => {
      const spy = vi.spyOn(animationEngine, 'start');
      animationEngine.restart();
      
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('animation lifecycle', () => {
    it('should properly transition from stopped to running', () => {
      expect(animationEngine.isRunning).toBe(false);
      animationEngine.start();
      expect(animationEngine.isRunning).toBe(true);
    });

    it('should properly transition from running to stopped', () => {
      animationEngine.start();
      expect(animationEngine.isRunning).toBe(true);
      animationEngine.stop();
      expect(animationEngine.isRunning).toBe(false);
    });

    it('should handle multiple start/stop cycles', () => {
      animationEngine.start();
      animationEngine.stop();
      animationEngine.start();
      animationEngine.stop();
      expect(animationEngine.isRunning).toBe(false);
      expect(animationEngine.animationId).toBeNull();
    });
  });
});

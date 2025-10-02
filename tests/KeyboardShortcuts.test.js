import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KeyboardShortcuts } from '../modules/KeyboardShortcuts.js';

describe('KeyboardShortcuts', () => {
  let keyboardShortcuts;
  let mockFramework;
  let mockStateManager;
  let mockConfig;

  beforeEach(() => {
    // Mock config
    mockConfig = {
      showForces: false
    };

    // Mock state manager
    mockStateManager = {
      generateVectors: vi.fn()
    };

    // Mock framework
    mockFramework = {
      stateManager: mockStateManager,
      getConfig: vi.fn(() => mockConfig),
      updateConfig: vi.fn((key, value) => {
        mockConfig[key] = value;
      }),
      addInputVector: vi.fn()
    };

    keyboardShortcuts = new KeyboardShortcuts(mockFramework);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with framework', () => {
      expect(keyboardShortcuts.framework).toBe(mockFramework);
    });
  });

  describe('initialize', () => {
    it('should add keydown event listener to document', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      keyboardShortcuts.initialize();
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('handleKeyPress', () => {
    describe('Space key', () => {
      it('should call generateVectors when Space is pressed', () => {
        const event = new KeyboardEvent('keydown', { code: 'Space' });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        
        keyboardShortcuts.handleKeyPress(event);
        
        expect(mockStateManager.generateVectors).toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalled();
      });

      it('should not generate vectors when modal is open', () => {
        // Mock modal presence
        const mockModal = document.createElement('div');
        mockModal.className = 'input-editor-modal';
        document.body.appendChild(mockModal);

        const event = new KeyboardEvent('keydown', { code: 'Space' });
        keyboardShortcuts.handleKeyPress(event);
        
        expect(mockStateManager.generateVectors).not.toHaveBeenCalled();

        // Cleanup
        document.body.removeChild(mockModal);
      });
    });

    describe('KeyF key', () => {
      it('should toggle showForces when F is pressed', () => {
        const event = new KeyboardEvent('keydown', { code: 'KeyF' });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        
        mockConfig.showForces = false;
        keyboardShortcuts.handleKeyPress(event);
        
        expect(mockFramework.updateConfig).toHaveBeenCalledWith('showForces', true);
        expect(event.preventDefault).toHaveBeenCalled();
      });

      it('should toggle showForces from true to false', () => {
        const event = new KeyboardEvent('keydown', { code: 'KeyF' });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        
        mockConfig.showForces = true;
        keyboardShortcuts.handleKeyPress(event);
        
        expect(mockFramework.updateConfig).toHaveBeenCalledWith('showForces', false);
      });

      it('should not toggle showForces when modal is open', () => {
        const mockModal = document.createElement('div');
        mockModal.className = 'input-editor-modal';
        document.body.appendChild(mockModal);

        const event = new KeyboardEvent('keydown', { code: 'KeyF' });
        keyboardShortcuts.handleKeyPress(event);
        
        expect(mockFramework.updateConfig).not.toHaveBeenCalled();

        document.body.removeChild(mockModal);
      });
    });

    describe('KeyI key', () => {
      it('should call addInputVector when I is pressed', () => {
        const event = new KeyboardEvent('keydown', { code: 'KeyI' });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        
        keyboardShortcuts.handleKeyPress(event);
        
        expect(mockFramework.addInputVector).toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalled();
      });

      it('should not add input vector when modal is open', () => {
        const mockModal = document.createElement('div');
        mockModal.className = 'input-editor-modal';
        document.body.appendChild(mockModal);

        const event = new KeyboardEvent('keydown', { code: 'KeyI' });
        keyboardShortcuts.handleKeyPress(event);
        
        expect(mockFramework.addInputVector).not.toHaveBeenCalled();

        document.body.removeChild(mockModal);
      });
    });

    describe('other keys', () => {
      it('should not do anything for unhandled keys', () => {
        const event = new KeyboardEvent('keydown', { code: 'KeyA' });
        keyboardShortcuts.handleKeyPress(event);
        
        expect(mockStateManager.generateVectors).not.toHaveBeenCalled();
        expect(mockFramework.updateConfig).not.toHaveBeenCalled();
        expect(mockFramework.addInputVector).not.toHaveBeenCalled();
      });

      it('should handle multiple different keys in sequence', () => {
        const spaceEvent = new KeyboardEvent('keydown', { code: 'Space' });
        Object.defineProperty(spaceEvent, 'preventDefault', { value: vi.fn() });
        keyboardShortcuts.handleKeyPress(spaceEvent);
        expect(mockStateManager.generateVectors).toHaveBeenCalledTimes(1);

        const keyFEvent = new KeyboardEvent('keydown', { code: 'KeyF' });
        Object.defineProperty(keyFEvent, 'preventDefault', { value: vi.fn() });
        keyboardShortcuts.handleKeyPress(keyFEvent);
        expect(mockFramework.updateConfig).toHaveBeenCalledTimes(1);

        const keyIEvent = new KeyboardEvent('keydown', { code: 'KeyI' });
        Object.defineProperty(keyIEvent, 'preventDefault', { value: vi.fn() });
        keyboardShortcuts.handleKeyPress(keyIEvent);
        expect(mockFramework.addInputVector).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('integration tests', () => {
    it('should work when initialized and key is pressed', () => {
      keyboardShortcuts.initialize();
      
      const event = new KeyboardEvent('keydown', { code: 'Space', bubbles: true });
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
      
      document.dispatchEvent(event);
      
      expect(mockStateManager.generateVectors).toHaveBeenCalled();
    });
  });
});

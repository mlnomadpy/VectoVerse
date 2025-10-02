import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ErrorHandler } from '../modules/ErrorHandler.js';

describe('ErrorHandler', () => {
  let errorHandler;
  let mockFramework;
  let mockStateManager;

  beforeEach(() => {
    // Mock state manager
    mockStateManager = {
      generateVectors: vi.fn(),
      reduceVectorCount: vi.fn(),
      reset: vi.fn()
    };

    // Mock framework
    mockFramework = {
      stateManager: mockStateManager,
      getConfig: vi.fn(() => ({ numVectors: 30 })),
      updateConfig: vi.fn()
    };

    // Mock global objects
    global.window = {
      addEventListener: vi.fn(),
      location: { reload: vi.fn(), href: 'http://test.com' },
      innerWidth: 1920,
      innerHeight: 1080
    };

    global.navigator = {
      userAgent: 'Test Browser',
      platform: 'Test Platform',
      language: 'en-US',
      cookieEnabled: true,
      onLine: true,
      deviceMemory: 8,
      hardwareConcurrency: 4
    };

    global.screen = {
      width: 1920,
      height: 1080
    };

    global.localStorage = {
      getItem: vi.fn(() => '[]'),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };

    global.document = {
      createElement: vi.fn(() => ({
        className: '',
        innerHTML: '',
        querySelector: vi.fn(() => ({
          onclick: null
        })),
        remove: vi.fn()
      })),
      body: {
        appendChild: vi.fn()
      },
      querySelectorAll: vi.fn(() => [])
    };

    global.Intl = {
      DateTimeFormat: () => ({
        resolvedOptions: () => ({ timeZone: 'UTC' })
      })
    };

    errorHandler = new ErrorHandler(mockFramework);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with framework', () => {
      expect(errorHandler.framework).toBe(mockFramework);
    });

    it('should initialize error log as empty array', () => {
      expect(errorHandler.errorLog).toEqual([]);
    });

    it('should setup global error handling', () => {
      expect(global.window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
      expect(global.window.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    });
  });

  describe('classifyError', () => {
    it('should classify network errors', () => {
      const error = new Error('Network request failed');
      expect(errorHandler.classifyError(error)).toBe('network');
    });

    it('should classify permission errors', () => {
      const error = new Error('Permission denied');
      expect(errorHandler.classifyError(error)).toBe('permission');
    });

    it('should classify memory errors', () => {
      const error = new Error('Memory allocation failed');
      expect(errorHandler.classifyError(error)).toBe('memory');
    });

    it('should classify validation errors', () => {
      const error = new Error('Invalid input data');
      expect(errorHandler.classifyError(error)).toBe('validation');
    });

    it('should classify timeout errors', () => {
      const error = new Error('Request timeout');
      expect(errorHandler.classifyError(error)).toBe('timeout');
    });

    it('should classify unknown errors', () => {
      const error = null;
      expect(errorHandler.classifyError(error)).toBe('unknown');
    });

    it('should classify generic application errors', () => {
      const error = new Error('Something went wrong');
      expect(errorHandler.classifyError(error)).toBe('application');
    });
  });

  describe('handleError', () => {
    it('should add error to error log', () => {
      const error = new Error('Test error');
      errorHandler.handleError(error);
      
      expect(errorHandler.errorLog.length).toBe(1);
      expect(errorHandler.errorLog[0].message).toBe('Test error');
    });

    it('should generate unique error ID', () => {
      const error = new Error('Test error');
      errorHandler.handleError(error);
      
      expect(errorHandler.errorLog[0].id).toMatch(/^err_/);
    });

    it('should include timestamp', () => {
      const error = new Error('Test error');
      errorHandler.handleError(error);
      
      expect(errorHandler.errorLog[0].timestamp).toBeDefined();
      expect(typeof errorHandler.errorLog[0].timestamp).toBe('string');
    });

    it('should include error context', () => {
      const error = new Error('Test error');
      const context = { filename: 'test.js', lineno: 10 };
      errorHandler.handleError(error, context);
      
      expect(errorHandler.errorLog[0].context).toEqual(context);
    });

    it('should classify error severity', () => {
      const error = new Error('Network failure');
      errorHandler.handleError(error);
      
      expect(errorHandler.errorLog[0].severity).toBe('network');
    });

    it('should handle null error', () => {
      errorHandler.handleError(null);
      
      expect(errorHandler.errorLog[0].message).toBe('Unknown error');
    });
  });

  describe('getFriendlyMessage', () => {
    it('should return network-specific message', () => {
      const errorInfo = { severity: 'network' };
      const message = errorHandler.getFriendlyMessage(errorInfo);
      expect(message).toContain('Network connection');
    });

    it('should return permission-specific message', () => {
      const errorInfo = { severity: 'permission' };
      const message = errorHandler.getFriendlyMessage(errorInfo);
      expect(message).toContain('Permission denied');
    });

    it('should return memory-specific message', () => {
      const errorInfo = { severity: 'memory' };
      const message = errorHandler.getFriendlyMessage(errorInfo);
      expect(message).toContain('memory');
    });

    it('should return validation-specific message', () => {
      const errorInfo = { severity: 'validation' };
      const message = errorHandler.getFriendlyMessage(errorInfo);
      expect(message).toContain('Invalid data');
    });

    it('should return timeout-specific message', () => {
      const errorInfo = { severity: 'timeout' };
      const message = errorHandler.getFriendlyMessage(errorInfo);
      expect(message).toContain('timed out');
    });

    it('should return generic message for unknown severity', () => {
      const errorInfo = { severity: 'unknown' };
      const message = errorHandler.getFriendlyMessage(errorInfo);
      expect(message).toContain('unexpected error');
    });
  });

  describe('getSuggestedActions', () => {
    it('should suggest retry for network errors', () => {
      const errorInfo = { severity: 'network' };
      const actions = errorHandler.getSuggestedActions(errorInfo);
      
      expect(actions.length).toBeGreaterThan(0);
      expect(actions[0].text).toBe('Retry');
    });

    it('should suggest reduce vectors for memory errors', () => {
      const errorInfo = { severity: 'memory' };
      const actions = errorHandler.getSuggestedActions(errorInfo);
      
      expect(actions.some(a => a.text === 'Reduce Vectors')).toBe(true);
    });

    it('should suggest reset for validation errors', () => {
      const errorInfo = { severity: 'validation' };
      const actions = errorHandler.getSuggestedActions(errorInfo);
      
      expect(actions.some(a => a.text === 'Reset Data')).toBe(true);
    });

    it('should suggest reload for unknown errors', () => {
      const errorInfo = { severity: 'unknown' };
      const actions = errorHandler.getSuggestedActions(errorInfo);
      
      expect(actions.some(a => a.text === 'Reload App')).toBe(true);
    });
  });

  describe('getErrorIcon', () => {
    it('should return correct icon for each severity', () => {
      expect(errorHandler.getErrorIcon('network')).toBe('🌐');
      expect(errorHandler.getErrorIcon('permission')).toBe('🔒');
      expect(errorHandler.getErrorIcon('memory')).toBe('💾');
      expect(errorHandler.getErrorIcon('validation')).toBe('⚠️');
      expect(errorHandler.getErrorIcon('timeout')).toBe('⏱️');
      expect(errorHandler.getErrorIcon('unknown')).toBe('⚠️');
    });
  });

  describe('attemptRecovery', () => {
    it('should reduce vectors for memory errors', () => {
      const errorInfo = { severity: 'memory' };
      mockFramework.getConfig = vi.fn(() => ({ numVectors: 30 }));
      
      errorHandler.attemptRecovery(errorInfo);
      
      expect(mockFramework.updateConfig).toHaveBeenCalledWith('numVectors', 15);
      expect(mockStateManager.generateVectors).toHaveBeenCalled();
    });

    it('should not reduce vectors if already low', () => {
      const errorInfo = { severity: 'memory' };
      mockFramework.getConfig = vi.fn(() => ({ numVectors: 10 }));
      
      errorHandler.attemptRecovery(errorInfo);
      
      expect(mockFramework.updateConfig).not.toHaveBeenCalled();
    });

    it('should regenerate vectors for validation errors', () => {
      const errorInfo = { severity: 'validation' };
      
      errorHandler.attemptRecovery(errorInfo);
      
      expect(mockStateManager.generateVectors).toHaveBeenCalled();
    });
  });

  describe('generateErrorId', () => {
    it('should generate unique IDs', () => {
      const id1 = errorHandler.generateErrorId();
      const id2 = errorHandler.generateErrorId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^err_/);
      expect(id2).toMatch(/^err_/);
    });
  });

  describe('getErrorReport', () => {
    it('should return error report with all info', () => {
      const error = new Error('Test error');
      errorHandler.handleError(error);
      
      const report = errorHandler.getErrorReport();
      
      expect(report.errors).toBeDefined();
      expect(report.systemInfo).toBeDefined();
      expect(report.timestamp).toBeDefined();
    });

    it('should include system information', () => {
      const report = errorHandler.getErrorReport();
      
      expect(report.systemInfo.userAgent).toBe('Test Browser');
      expect(report.systemInfo.platform).toBe('Test Platform');
      expect(report.systemInfo.language).toBe('en-US');
    });
  });

  describe('getSystemInfo', () => {
    it('should collect all system information', () => {
      const info = errorHandler.getSystemInfo();
      
      expect(info.userAgent).toBe('Test Browser');
      expect(info.platform).toBe('Test Platform');
      expect(info.language).toBe('en-US');
      expect(info.cookieEnabled).toBe(true);
      expect(info.onLine).toBe(true);
      expect(info.memory).toBe(8);
      expect(info.cores).toBe(4);
    });
  });

  describe('clearErrorLog', () => {
    it('should clear error log array', () => {
      errorHandler.errorLog = [{ id: 'test' }];
      errorHandler.clearErrorLog();
      
      expect(errorHandler.errorLog).toEqual([]);
    });

    it('should remove from localStorage', () => {
      errorHandler.clearErrorLog();
      
      expect(global.localStorage.removeItem).toHaveBeenCalledWith('vectoverse-errors');
    });
  });

  describe('wrapAsyncOperation', () => {
    it('should execute operation successfully', async () => {
      const operation = vi.fn(async (x) => x * 2);
      const wrapped = errorHandler.wrapAsyncOperation(operation, 'test');
      
      const result = await wrapped(5);
      
      expect(result).toBe(10);
      expect(operation).toHaveBeenCalledWith(5);
    });

    it('should handle errors and re-throw', async () => {
      const operation = vi.fn(async () => {
        throw new Error('Async error');
      });
      const wrapped = errorHandler.wrapAsyncOperation(operation, 'test');
      
      await expect(wrapped()).rejects.toThrow('Async error');
      expect(errorHandler.errorLog.length).toBeGreaterThan(0);
    });
  });

  describe('validateInput', () => {
    it('should return true for valid input', () => {
      const validator = (x) => x > 0;
      const result = errorHandler.validateInput(5, validator, 'Must be positive');
      
      expect(result).toBe(true);
    });

    it('should return false for invalid input', () => {
      const validator = (x) => x > 0;
      const result = errorHandler.validateInput(-5, validator, 'Must be positive');
      
      expect(result).toBe(false);
      expect(errorHandler.errorLog.length).toBeGreaterThan(0);
    });

    it('should handle validator throwing error', () => {
      const validator = () => { throw new Error('Validator error'); };
      const result = errorHandler.validateInput(5, validator, 'Error');
      
      expect(result).toBe(false);
      expect(errorHandler.errorLog.length).toBeGreaterThan(0);
    });
  });
});

# VectoVerse Unit Tests

This directory contains comprehensive unit tests for the VectoVerse modules.

## Running Tests

To run all tests:
```bash
npm test
```

To run tests in watch mode (during development):
```bash
npm test
```

To run tests once and exit:
```bash
npm run test:run
```

To run tests with UI:
```bash
npm run test:ui
```

To run tests with coverage report:
```bash
npm test -- --coverage
```

## Test Coverage

The test suite covers the following modules:

### VectorOperations.test.js
Tests for core vector mathematical operations:
- **add**: Vector addition
- **subtract**: Vector subtraction
- **scale**: Scalar multiplication
- **magnitude**: Vector magnitude calculation
- **normalize**: Vector normalization
- **dotProduct**: Dot product calculation
- **distanceSquared**: Squared Euclidean distance
- **distance**: Euclidean distance

**Total tests**: 31

### ForceCalculator.test.js
Tests for physics-inspired force calculations:
- **dotProduct**: Dot product for vectors
- **distanceSquared**: Distance squared calculation
- **euclideanDistance**: Euclidean distance
- **magnitude**: Vector magnitude
- **cosineSimilarity**: Cosine similarity measure
- **resonanceForce**: Custom resonance force calculation
- **informationEntropy**: Shannon entropy calculation
- **correlation**: Pearson correlation coefficient
- **quantumEntanglement**: Quantum-inspired correlation
- **harmonicAlignment**: Harmonic resonance measure
- **nuclearStability**: Normalized magnitude measure
- **getInformationQuantums**: Component categorization
- **getVectorStatistics**: Comprehensive statistics
- **calculateSkewness**: Third moment calculation
- **calculateKurtosis**: Fourth moment calculation
- **electromagneticForce**: Coulomb's law inspired force
- **gravitationalAttraction**: Newton's law inspired force

**Total tests**: 53

### EventBus.test.js
Tests for the event system:
- **on**: Event listener registration
- **off**: Event listener removal
- **emit**: Event emission with data

**Total tests**: 14

### StateManager.test.js
Tests for state management:
- **getVectors**: Vector retrieval
- **getInputVector**: Input vector retrieval
- **getSelectedVector**: Selected vector retrieval
- **generateVectors**: Random vector generation
- **selectVector**: Vector selection
- **addInputVector**: Input vector creation
- **removeInputVector**: Input vector removal
- **randomizeInputVector**: Input vector randomization
- **updateInputVectorComponent**: Component update
- **removeVector**: Vector removal
- **setVectorCustomColor**: Color customization
- **setVectorScale**: Scale customization
- **addCustomVector**: Custom vector addition

**Total tests**: 48

### FileHandler.test.js
Tests for file parsing and handling:
- **parseJSON**: JSON format parsing
- **parseCSV**: CSV format parsing
- **parseTXT**: Text format parsing
- **autoDetectFormat**: Automatic format detection
- **showProgress**: Progress display
- **hideProgress**: Progress hiding
- **showSuccess**: Success notification
- **showError**: Error notification

**Total tests**: 40

### TSNE.test.js
Tests for t-SNE dimensionality reduction:
- **constructor**: Option initialization
- **run**: t-SNE algorithm execution
- Various edge cases and data formats

**Total tests**: 24

### ConfigManager.test.js
Tests for configuration management:
- **constructor**: Default config initialization
- **getConfig**: Config retrieval
- **updateConfig**: Config updates with various data types
- Edge cases: null, undefined, zero, negative values, objects, arrays

**Total tests**: 19

### AnimationEngine.test.js
Tests for animation system:
- **constructor**: Initialization with SVG and framework
- **start/stop**: Animation lifecycle management
- **updateAnimations**: Update cycle coordination
- **updateVectorPulse**: Vector pulse animation
- **updateInputVectorFloat**: Input vector floating effect
- **updateForceLineAnimation**: Force line animations
- **restart**: Animation restart mechanism

**Total tests**: 23

### KeyboardShortcuts.test.js
Tests for keyboard shortcut handling:
- **constructor**: Initialization with framework
- **initialize**: Event listener setup
- **handleKeyPress**: Key event handling
- Space key: Generate vectors
- F key: Toggle force display
- I key: Add input vector
- Modal blocking: Prevent shortcuts when modal is open

**Total tests**: 10

### VectorAnalysisStudio.test.js
Tests for vector analysis functionality:
- **constructor**: Framework and state initialization
- **initializeState**: State structure validation
- **initializeComponents**: Component management
- **createBoundHandlers**: Event handler binding
- **initializeEventListeners**: Event registration
- **cacheElements**: DOM element caching
- **initialize**: Initialization lifecycle
- **getModules/getState**: Framework integration
- **safeExecute**: Error handling wrapper
- **onStateChanged**: State change event handling
- Edge cases: Missing DOM elements, null events

**Total tests**: 33

### ErrorHandler.test.js
Tests for comprehensive error handling system:
- **constructor**: Initialization and global error setup
- **classifyError**: Error type classification (network, permission, memory, validation, timeout)
- **handleError**: Error capture and logging
- **getFriendlyMessage**: User-friendly error messages
- **getSuggestedActions**: Context-aware recovery actions
- **getErrorIcon**: Visual error representation
- **attemptRecovery**: Automatic error recovery
- **generateErrorId**: Unique error identification
- **getErrorReport**: Error reporting and system info
- **clearErrorLog**: Error log management
- **wrapAsyncOperation**: Async operation error handling
- **validateInput**: Input validation with error handling

**Total tests**: 39

## Total Test Count: 334 tests

## Testing Framework

The tests use [Vitest](https://vitest.dev/), a fast unit testing framework that works seamlessly with Vite.

### Key Features:
- ✅ ES6 module support
- ✅ Fast execution
- ✅ Watch mode for development
- ✅ Code coverage reporting
- ✅ Happy DOM for DOM testing

## Writing New Tests

When adding new tests, follow these conventions:

1. Create a new test file in the `tests/` directory with the `.test.js` extension
2. Import the module you want to test
3. Use descriptive test names that explain what is being tested
4. Group related tests using `describe` blocks
5. Use `beforeEach` for test setup when needed
6. Test both happy paths and edge cases
7. Mock external dependencies (framework, DOM, etc.)

Example:
```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MyModule } from '../modules/MyModule.js';

describe('MyModule', () => {
  let instance;
  let mockFramework;

  beforeEach(() => {
    mockFramework = {
      getState: vi.fn(() => ({})),
      eventBus: { on: vi.fn(), emit: vi.fn() }
    };
    instance = new MyModule(mockFramework);
  });

  describe('myFunction', () => {
    it('should do something correctly', () => {
      const result = instance.myFunction(input);
      expect(result).toBe(expected);
    });

    it('should handle edge cases', () => {
      expect(() => instance.myFunction(null)).toThrow();
    });
  });
});
```

## Continuous Integration

These tests are designed to run in CI/CD pipelines. They require no browser or external dependencies beyond Node.js.

## Code Coverage

To generate a code coverage report:
```bash
npm test -- --coverage
```

Coverage reports will be generated in the `coverage/` directory.

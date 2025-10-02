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

## Total Test Count: 210 tests

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

Example:
```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { MyModule } from '../modules/MyModule.js';

describe('MyModule', () => {
  let instance;

  beforeEach(() => {
    instance = new MyModule();
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

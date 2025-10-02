# Contributing to VectoVerse

Thank you for your interest in contributing to VectoVerse! This document provides guidelines and instructions for contributing to the project.

## 🎯 How to Contribute

### Reporting Issues
- Use the GitHub issue tracker
- Provide clear, detailed descriptions
- Include steps to reproduce bugs
- Attach screenshots for UI issues
- Specify your environment (OS, browser, Node version)

### Suggesting Enhancements
- Check existing issues first
- Clearly describe the enhancement
- Explain the use case and benefits
- Consider backward compatibility

### Pull Requests
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following our guidelines
4. Write/update tests for your changes
5. Ensure all tests pass (`npm test`)
6. Update documentation as needed
7. Commit with clear messages
8. Push to your fork
9. Open a Pull Request

## 📋 Development Setup

### Prerequisites
- Node.js 16+ 
- npm 7+
- Git

### Installation
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/VectoVerse.git
cd VectoVerse

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests in watch mode
npm test
```

## 🧪 Testing Guidelines

### Writing Tests
All new features and bug fixes should include tests. Follow these guidelines:

#### Test File Structure
```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { YourModule } from '../modules/YourModule.js';

describe('YourModule', () => {
  let instance;
  let mockFramework;

  beforeEach(() => {
    // Setup mocks
    mockFramework = {
      getState: vi.fn(() => ({})),
      eventBus: { 
        on: vi.fn(), 
        emit: vi.fn() 
      }
    };
    
    instance = new YourModule(mockFramework);
  });

  describe('methodName', () => {
    it('should do something correctly', () => {
      const result = instance.methodName(input);
      expect(result).toBe(expected);
    });

    it('should handle edge cases', () => {
      expect(() => instance.methodName(null)).toThrow();
    });
  });
});
```

#### Test Coverage Requirements
- Aim for 80%+ code coverage
- Test happy paths and edge cases
- Mock external dependencies
- Test error handling
- Verify async operations complete

#### Running Tests
```bash
# Run all tests
npm test

# Run tests once
npm run test:run

# Run tests with coverage
npm test -- --coverage

# Run tests with UI
npm run test:ui

# Run specific test file
npm test -- tests/YourModule.test.js
```

## 💻 Code Style Guidelines

### JavaScript Style
- Use ES6+ features
- Prefer `const` over `let`, avoid `var`
- Use arrow functions for callbacks
- Use template literals for strings
- Use destructuring where appropriate
- Keep functions small and focused
- Add JSDoc comments for public APIs

### Naming Conventions
- **Classes**: PascalCase (`VectorRenderer`)
- **Functions/Methods**: camelCase (`calculateForce`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_VECTORS`)
- **Private fields**: prefix with underscore (`_privateField`)
- **Files**: PascalCase for classes, camelCase for utilities

### Module Organization
```javascript
// 1. Imports
import { Module1 } from './Module1.js';
import { Module2 } from './Module2.js';

// 2. Constants
const DEFAULT_CONFIG = { ... };

// 3. Main class
export class MyModule {
  // Constructor
  constructor(framework) { ... }
  
  // Public methods
  publicMethod() { ... }
  
  // Private methods
  _privateMethod() { ... }
}

// 4. Helper functions (if needed)
function helperFunction() { ... }
```

### Error Handling
- Always handle errors gracefully
- Use try-catch for async operations
- Provide user-friendly error messages
- Log errors appropriately
- Use ErrorHandler module when possible

```javascript
try {
  await riskyOperation();
} catch (error) {
  this.framework.modules.errorHandler?.handleError(error, {
    context: 'Operation Name',
    metadata: { /* relevant data */ }
  });
}
```

## 📚 Documentation

### Code Comments
- Write self-documenting code when possible
- Add comments for complex logic
- Use JSDoc for public APIs
- Keep comments up-to-date

### JSDoc Example
```javascript
/**
 * Calculate the force between two vectors
 * @param {Object} vector1 - First vector with components array
 * @param {Object} vector2 - Second vector with components array
 * @param {string} forceType - Type of force to calculate
 * @returns {number} Calculated force value
 * @throws {Error} If vectors are invalid
 */
calculateForce(vector1, vector2, forceType) {
  // Implementation
}
```

### README Updates
- Update README.md for user-facing changes
- Update tests/README.md for new test files
- Include examples for new features
- Update version roadmap if applicable

## 🏗️ Architecture Guidelines

### Module Design
- Keep modules focused on single responsibility
- Use dependency injection (pass framework)
- Emit events for state changes
- Don't directly manipulate DOM from logic modules
- Separate concerns: logic, UI, rendering

### State Management
- Use StateManager for application state
- Don't store state in multiple places
- Emit events when state changes
- Use EventBus for cross-module communication

### Performance
- Avoid O(n²) algorithms when possible
- Use requestAnimationFrame for animations
- Debounce/throttle expensive operations
- Clean up event listeners and timers

## 🚀 Pull Request Process

### Before Submitting
- [ ] All tests pass locally
- [ ] New tests added for changes
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No console.log statements left
- [ ] Commit messages are clear

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] All tests passing

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process
1. Automated tests must pass
2. Code review by maintainers
3. Address feedback and suggestions
4. Final approval and merge

## 🐛 Debugging Tips

### Common Issues

**Tests Failing**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm test
```

**Animation Issues**
- Check requestAnimationFrame mocking in tests
- Verify cleanup in afterEach/beforeEach
- Use stop() methods to prevent infinite loops

**State Issues**
- Check EventBus listeners are properly cleaned up
- Verify StateManager state updates emit events
- Use framework.getState() not direct state access

### Debugging Tests
```javascript
// Use vi.fn() to spy on methods
const spy = vi.spyOn(instance, 'method');
expect(spy).toHaveBeenCalledWith(expectedArgs);

// Use console.log in tests (remove before commit)
it('should do something', () => {
  console.log('State:', instance.getState());
  // test code
});
```

## 📞 Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Create a GitHub Issue
- **Security**: Email security@vectoverse.dev (if available)
- **Chat**: Join our Discord (if available)

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

## 🙏 Acknowledgments

Thank you to all contributors who help make VectoVerse better!

---

*Last Updated: December 2024*

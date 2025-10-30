# Test Suite Documentation

This directory contains a comprehensive test suite for the Rulebase project, organized into a clear structure for maintainability and scalability.

## Directory Structure

```
tests/
├── fixtures/         # Test data and mock objects
├── helpers/          # Shared utilities and test framework
├── unit/             # Unit tests for individual modules
├── integration/      # Integration tests for component interactions
├── e2e/              # End-to-end tests for complete workflows
├── run-tests.js      # Cross-platform test runner
└── README.md         # This documentation
```

## Running Tests

### Quick Start

```bash
# Run all tests
node tests/run-tests.js

# Run with verbose output
node tests/run-tests.js --verbose

# Run only unit tests
node tests/run-tests.js --unit

# Run only integration tests
node tests/run-tests.js --integration

# Run only end-to-end tests
node tests/run-tests.js --e2e

# Run tests matching a pattern
node tests/run-tests.js --pattern="github"

# Stop on first failure
node tests/run-tests.js --fail-fast
```

### Command Line Options

- `--verbose, -v`: Show detailed test output
- `--fail-fast, -f`: Stop on first test failure
- `--pattern=<pattern>`: Run only tests matching the pattern
- `--unit`: Run only unit tests
- `--integration`: Run only integration tests
- `--e2e`: Run only end-to-end tests
- `--help, -h`: Show help message

## Test Categories

### Unit Tests (`unit/`)

Test individual modules in isolation:

- **github-api.test.js**: Tests GitHub API wrapper functionality
- **rule-scanner.test.js**: Tests rule discovery and file system operations
- **file-updater.test.js**: Tests markdown generation and file updates
- **reaction-collector.test.js**: Tests reaction collection and aggregation

### Integration Tests (`integration/`)

Test component interactions:

- **workflow.test.js**: Tests complete workflow integration between modules

### End-to-End Tests (`e2e/`)

Test complete user scenarios:

- **complete-workflow.test.js**: Tests full workflow execution
- **edge-cases.test.js**: Tests error handling and boundary conditions

## Test Framework

The test suite uses a custom lightweight framework (`helpers/test-utils.js`) that provides:

- **TestFramework**: Organizes tests with `describe` and `it` blocks
- **Assertions**: Basic assertion methods (`assertEqual`, `assertTrue`, etc.)
- **TestHelpers**: Utilities for temporary files, delays, and mock data

### Specialized Assertions

The `RulebaseAssertions` class (`helpers/assertions.js`) provides domain-specific assertions:

- `assertValidReactions()`: Validates reaction objects
- `assertValidRuleKey()`: Validates rule naming conventions
- `assertMarkdownStructure()`: Validates generated markdown
- `assertExecutionTime()`: Performance testing

## Mock Data and Fixtures

### Mock GitHub API (`helpers/mock-github.js`)

Simulates GitHub API responses for testing without external dependencies:

```javascript
const { MockOctokit } = require('./helpers/mock-github');
const mockOctokit = new MockOctokit();

// Set custom responses
mockOctokit.setSearchResponse({ data: { items: [...] } });
mockOctokit.setCommentsResponse({ data: [...] });
```

### Test Fixtures (`fixtures/mock-data.js`)

Provides consistent test data:

- `mockRules`: Sample rule data with various quality levels
- `mockGitHubResponses`: Predefined API responses
- `edgeCaseData`: Data for testing boundary conditions
- `testDataGenerators`: Functions for generating random test data

## Writing Tests

### Basic Test Structure

```javascript
const { TestFramework, Assertions } = require('../helpers/test-utils');
const { RulebaseAssertions } = require('../helpers/assertions');

const framework = new TestFramework('My Test Suite');

framework.describe('Feature Group', () => {
  framework.beforeEach(() => {
    // Setup before each test
  });

  framework.afterEach(() => {
    // Cleanup after each test
  });

  framework.it('should do something', () => {
    // Test implementation
    Assertions.assertEqual(actual, expected, 'Description');
  });

  framework.it('should handle async operations', async () => {
    // Async test
    const result = await someAsyncFunction();
    RulebaseAssertions.assertValidReactions(result, 'Async result');
  });
});

// Run tests if this file is executed directly
if (require.main === module) {
  framework.run().then(() => {
    framework.printSummary();
    process.exit(framework.hasFailures() ? 1 : 0);
  });
}

module.exports = framework;
```

### Testing Guidelines

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Descriptive Names**: Use clear, descriptive test names that explain what is being tested
3. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification phases
4. **Error Testing**: Include tests for error conditions and edge cases
5. **Performance**: Use `assertExecutionTime()` for performance-critical operations
6. **Cleanup**: Always clean up temporary files and resources

### Mock Data Usage

```javascript
const { mockRules, mockGitHubResponses } = require('../fixtures/mock-data');

// Use predefined mock data
const testRule = mockRules.standard;

// Generate random test data
const { testDataGenerators } = require('../fixtures/mock-data');
const randomReactions = testDataGenerators.generateRandomReactions();
```

## Test Coverage

The test suite covers:

- ✅ **Core Functionality**: All main features and workflows
- ✅ **Error Handling**: Network errors, file system errors, invalid inputs
- ✅ **Edge Cases**: Empty data, large datasets, boundary conditions
- ✅ **Performance**: Execution time limits for critical operations
- ✅ **Integration**: Component interactions and data flow
- ✅ **End-to-End**: Complete user scenarios

## Continuous Integration

The test runner generates a JSON report (`test-results.json`) suitable for CI/CD integration:

```json
{
  "summary": {
    "total": 45,
    "passed": 43,
    "failed": 2,
    "duration": 1234
  },
  "results": [...]
}
```

## Troubleshooting

### Common Issues

1. **Module Not Found**: Ensure all dependencies are installed with `npm install`
2. **Permission Errors**: Check file system permissions for temporary directories
3. **Network Timeouts**: Mock GitHub API should prevent network calls in tests
4. **Path Issues**: All paths use absolute paths for cross-platform compatibility

### Debug Mode

Run tests with verbose output to see detailed information:

```bash
node tests/run-tests.js --verbose
```

### Performance Issues

If tests are running slowly:

1. Check for unnecessary delays in test code
2. Ensure mock data is being used instead of real API calls
3. Review file system operations for efficiency
4. Use the `--pattern` option to run specific tests

## Contributing

When adding new tests:

1. Follow the existing directory structure
2. Use the provided test framework and assertions
3. Include both positive and negative test cases
4. Add appropriate mock data to fixtures
5. Update this documentation if adding new test categories

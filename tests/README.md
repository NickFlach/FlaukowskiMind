# Flaukowski Testing Guide

This document outlines the testing strategy for the Flaukowski application.

## Test Structure

The test suite is organized into three main categories:

1. **Unit Tests** - Test individual components/functions in isolation
   - Location: `tests/client` and `tests/server`
   - Used for: Component rendering, isolated logic, utility functions

2. **Integration Tests** - Test how components/modules work together
   - Location: `tests/server/routes` and `tests/server/storage`
   - Used for: API routes, database operations

3. **End-to-End (E2E) Tests** - Test complete user flows and scenarios
   - Location: `tests/e2e`
   - Used for: Complete user journeys, full API flows

## Running Tests

### Prerequisites

- Make sure all dependencies are installed: `npm install`
- For E2E tests that use OpenAI, ensure the `OPENAI_API_KEY` environment variable is set

### Running the Test Suite

To run all tests:

```bash
npm test
```

To run a specific test file:

```bash
npx jest path/to/test/file.test.ts
```

To run tests in watch mode (automatically rerun when files change):

```bash
npx jest --watch
```

To run only server tests:

```bash
npx jest --selectProjects server
```

To run only client tests:

```bash
npx jest --selectProjects client
```

To run end-to-end tests:

```bash
npx jest --config jest-e2e.config.js
```

### Coverage Reports

To generate a test coverage report:

```bash
npx jest --coverage
```

The report will be available in the `coverage` directory.

## CI/CD Integration

The project includes a GitHub Actions CI/CD workflow in `.github/workflows/ci.yml` that:

1. Runs all tests on every push and pull request
2. Builds the application if tests pass
3. Deploys the application when merging to the main branch

## Best Practices

1. **Mock external services** - Use jest mocks for external API calls
2. **Test important paths** - Focus on testing critical business logic
3. **Maintain test independence** - Tests should not depend on each other
4. **Use descriptive test names** - Test names should describe what they're testing
5. **Keep tests fast** - Tests should run quickly to provide rapid feedback

## Adding New Tests

When adding new features:

1. Start with unit tests for the core functionality
2. Add integration tests to verify how it interacts with other components
3. Add E2E tests for critical user flows
4. Ensure all tests pass before merging
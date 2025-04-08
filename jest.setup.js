// Import Jest DOM specific assertions
import '@testing-library/jest-dom';

// Mock the global fetch API
global.fetch = jest.fn();

// Reset all mocks automatically between tests
beforeEach(() => {
  jest.resetAllMocks();
});

// Optional: Add any custom matchers or global setup logic here
// Jest setup file for global test configuration

// Mock console.log for cleaner test output
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  createMockOptions: (overrides = {}) => ({
    appName: 'test-app',
    appToken: 'test-token-123',
    ...overrides
  }),

  createMockEventOptions: (overrides = {}) => ({
    category: 'test-category',
    customAttributes: { test: 'value' },
    ...overrides
  }),

  createMockUserOptions: (overrides = {}) => ({
    id: 'test-user-123',
    email: 'test@example.com',
    ...overrides
  })
};
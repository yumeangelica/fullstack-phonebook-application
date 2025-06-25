module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/server/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/server/tests/setup.js'],
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/tests/**',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
  verbose: true,
  maxWorkers: 1,  // Run tests serially to avoid database conflicts
  // Transform ES modules from problematic packages
  transformIgnorePatterns: [
    'node_modules/(?!(bson|mongodb|mongoose)/)'
  ]
};

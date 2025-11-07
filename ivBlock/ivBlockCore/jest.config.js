module.exports = {
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageProvider: 'v8',
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/jest.config.js',
    '!**/GEMINI*.js',
    '!**/jquery-ui/**',
  ],
};
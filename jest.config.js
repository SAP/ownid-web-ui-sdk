module.exports = {
  moduleDirectories: ['node_modules'],
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
  globals: {
    window: {
      ownid: null,
      gigya: null,
    },
  },
  testEnvironment: 'jsdom',
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx)$',
  collectCoverageFrom: [
    'src/*.{js,ts}',
    'src/**/*.ts',
    '!**/*.test.{js,ts}',
    '!**/node_modules/**',
    '!src/test/**',
    '!dist/**',
    '!**/*.d.ts',
  ],
  resolver: 'jest-resolver-tsconfig-paths',
  collectCoverage: true,
  coverageDirectory: './out/coverage',
  coverageReporters: ['cobertura', 'text', 'html'],
  reporters: [
    'default',
    [
      'jest-trx-results-processor',
      {
        outputFile: 'dist/coverage/test-results.trx', // defaults to "test-results.trx"
        defaultUserName: 'anonymous', // defaults to "anonymous"
      },
    ],
  ],
  coverageThreshold: {
    global: {
      branches: 48,
      functions: 66,
      lines: 69,
      statements: 69,
    },
  },
};

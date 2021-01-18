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
    '!src/gigya/*.ts',
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
      statements: 78,
      branches: 63,
      lines: 80,
      functions: 77,
    },
  },
};

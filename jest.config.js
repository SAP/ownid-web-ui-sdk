module.exports = {
  setupFilesAfterEnv: [
      "<rootDir>/src/test/setup-jest.ts"
  ],
  moduleDirectories: ['node_modules'],
  transform: {
    ".(ts|tsx)": "ts-jest"
  },
  globals: {
    "window": {}
  },
  testEnvironment: "node",
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx)$",
  collectCoverageFrom: [
    'src/*.{js,ts}',
    'src/**/*.ts',
    '!**/*.test.{js,ts}',
    '!**/node_modules/**',
    '!src/test/**',
    '!dist/**',
    '!**/*.d.ts'
  ],
  resolver: "jest-resolver-tsconfig-paths",
  collectCoverage: true,
  coverageDirectory: './dist/coverage',
  coverageReporters: ['cobertura', 'text'],
  reporters: [
    "default",
    [
      "jest-trx-results-processor",
      {
        "outputFile": "dist/coverage/test-results.trx", // defaults to "test-results.trx"
        "defaultUserName": "anonymous" // defaults to "anonymous"
      }
    ]
  ],
  coverageThreshold: {
    "global": {
      "branches": 90,
      "functions": 90,
      "lines": 90,
      "statements": 90
    }
  }
};

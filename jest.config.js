// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};

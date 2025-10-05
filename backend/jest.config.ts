import type { Config } from '@jest/types';

const configJest: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/test/unit/**/*.test.(ts|js)',
    '**/test/integration/**/*.test.(ts|js)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  clearMocks: true,
  collectCoverage: process.env.CI === 'true',
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  setupFiles: ['<rootDir>/test/setupEnv.ts', 'dotenv/config'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  verbose: true,
};

export default configJest;

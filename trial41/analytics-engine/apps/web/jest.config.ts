import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@analytics-engine/shared(.*)$': '<rootDir>/../../packages/shared/src$1',
  },
  setupFilesAfterSetup: ['<rootDir>/jest.setup.ts'],
};

export default config;

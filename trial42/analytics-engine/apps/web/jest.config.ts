import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@analytics-engine/shared$': '<rootDir>/../../packages/shared/src',
  },
  setupFilesAfterSetup: [],
  testPathPattern: '.*\\.spec\\.tsx?$',
};

export default config;

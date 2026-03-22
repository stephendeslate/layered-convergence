import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@escrow-marketplace/shared$': '<rootDir>/../../packages/shared/src',
  },
  setupFilesAfterSetup: [],
};

export default config;

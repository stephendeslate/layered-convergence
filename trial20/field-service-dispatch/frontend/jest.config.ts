import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterSetup: ['<rootDir>/jest.setup.ts'],
  testPathPattern: '.*\\.test\\.tsx?$',
};

export default config;

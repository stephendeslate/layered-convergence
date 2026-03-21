/**
 * Test setup file — loaded before all tests via vitest.config.ts setupFiles.
 */

// Ensure test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.BCRYPT_ROUNDS = '4';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5434/analytics_engine_test?schema=public';
process.env.REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6381/1';

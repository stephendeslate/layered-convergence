// TRACED:EM-SEC-08 environment variable validation at startup
export function validateEnv(): void {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'CORS_ORIGIN'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

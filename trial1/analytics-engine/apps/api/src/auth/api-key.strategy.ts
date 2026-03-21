/**
 * API Key authentication is handled directly by ApiKeyAuthGuard
 * which implements CanActivate and doesn't need a passport strategy.
 *
 * This file is kept as documentation of the approach.
 * The ApiKeyAuthGuard extracts the API key from the X-API-Key header
 * or apiKey query parameter, hashes it with SHA-256, and validates
 * it against the api_keys table.
 */

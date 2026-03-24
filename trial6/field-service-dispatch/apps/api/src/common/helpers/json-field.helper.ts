import { Prisma } from '@prisma/client';

/**
 * Typed helper for converting values to Prisma Json fields.
 * Centralizes the serialization boundary per CED v6.0 Convention 5.19.
 */
export function toJsonField<T>(value: T): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Typed helper for converting Prisma Json fields back to typed values.
 * Centralizes the deserialization boundary per CED v6.0 Convention 5.19.
 */
export function fromJsonField<T>(json: Prisma.JsonValue): T {
  return json as T; // Acceptable — JSON roundtrip preserves structure
}

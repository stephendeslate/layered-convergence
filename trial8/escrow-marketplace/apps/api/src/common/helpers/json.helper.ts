import { Prisma } from '@prisma/client';

/**
 * Type-safe helper to convert a plain object to Prisma InputJsonValue.
 * Prevents the need for `as any` or `as Prisma.InputJsonValue` assertions.
 */
export function toJsonValue<T extends Record<string, unknown> | unknown[]>(value: T): Prisma.InputJsonValue {
  return value as unknown as Prisma.InputJsonValue;
}

/**
 * Type-safe helper to parse a Prisma JsonValue into a typed object.
 * Use this instead of raw `as T` casts on JSON fields.
 */
export function fromJsonValue<T>(value: Prisma.JsonValue): T {
  return value as unknown as T;
}

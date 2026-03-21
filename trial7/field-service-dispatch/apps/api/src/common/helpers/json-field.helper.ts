import { Prisma } from '@prisma/client';

/**
 * Safely convert a typed object to a Prisma Json field value.
 * Avoids `as unknown as Prisma.InputJsonValue` casts.
 */
export function toJsonField<T>(value: T): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

/**
 * Safely parse a Prisma Json field value back to a typed object.
 * Avoids `as unknown as T` casts on Json fields.
 */
export function fromJsonField<T>(value: Prisma.JsonValue): T {
  return value as T;
}

import { Injectable, Logger } from '@nestjs/common';
import { RawRecord } from '../connectors/connector.interface';

export interface TransformStep {
  type: 'rename' | 'cast' | 'default' | 'dateFormat';
  [key: string]: unknown;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  fieldType: string; // STRING, NUMBER, DATE, BOOLEAN
  fieldRole: string; // DIMENSION, METRIC
  isRequired: boolean;
}

export interface MappedRecord {
  dimensions: Record<string, unknown>;
  metrics: Record<string, number>;
  timestamp: Date;
}

export interface TransformResult {
  records: MappedRecord[];
  deadLetters: { record: RawRecord; error: string }[];
}

@Injectable()
export class TransformService {
  private readonly logger = new Logger(TransformService.name);

  /**
   * Apply field mappings and transform steps to raw records.
   * Returns mapped records and dead letter entries for failures.
   */
  transform(
    rawRecords: RawRecord[],
    fieldMappings: FieldMapping[],
    transforms: TransformStep[],
  ): TransformResult {
    const records: MappedRecord[] = [];
    const deadLetters: { record: RawRecord; error: string }[] = [];

    for (const raw of rawRecords) {
      try {
        // Apply transforms first
        const transformed = this.applyTransforms(raw, transforms);

        // Then apply field mapping
        const mapped = this.applyFieldMapping(transformed, fieldMappings);
        if (mapped) {
          records.push(mapped);
        } else {
          deadLetters.push({
            record: raw,
            error: 'Field mapping failed: required field missing or type coercion failed',
          });
        }
      } catch (err: unknown) {
        const error = err as Error;
        deadLetters.push({
          record: raw,
          error: `Transform error: ${error.message}`,
        });
      }
    }

    return { records, deadLetters };
  }

  /**
   * Apply transform steps in order. Per SRS-3 section 1.5.
   */
  private applyTransforms(
    record: RawRecord,
    transforms: TransformStep[],
  ): RawRecord {
    const result = { ...record };

    for (const step of transforms) {
      switch (step.type) {
        case 'rename': {
          const from = step.from as string;
          const to = step.to as string;
          if (from in result) {
            result[to] = result[from];
            delete result[from];
          }
          break;
        }
        case 'cast': {
          const field = step.field as string;
          const targetType = step.targetType as string;
          if (field in result) {
            result[field] = this.coerceType(result[field], targetType);
          }
          break;
        }
        case 'default': {
          const field = step.field as string;
          const value = step.value;
          if (result[field] === null || result[field] === undefined) {
            result[field] = value;
          }
          break;
        }
        case 'dateFormat': {
          const field = step.field as string;
          const format = step.format as string;
          if (field in result && result[field] !== null) {
            result[field] = this.parseDateFormat(
              result[field] as string,
              format,
            );
          }
          break;
        }
      }
    }

    return result;
  }

  /**
   * Apply field mapping per SRS-3 section 1.4.
   */
  private applyFieldMapping(
    record: RawRecord,
    fieldMappings: FieldMapping[],
  ): MappedRecord | null {
    const dimensions: Record<string, unknown> = {};
    const metrics: Record<string, number> = {};
    let timestamp: Date | null = null;

    for (const mapping of fieldMappings) {
      const rawValue = record[mapping.sourceField];

      // Skip if required field is missing
      if (rawValue === undefined || rawValue === null) {
        if (mapping.isRequired) {
          return null; // Dead letter
        }
        continue;
      }

      // Type coercion
      const typedValue = this.coerceType(rawValue, mapping.fieldType);
      if (typedValue === null) {
        return null; // Type coercion failed
      }

      // Assign to dimensions or metrics
      if (mapping.fieldRole === 'DIMENSION') {
        dimensions[mapping.targetField] = typedValue;
      } else {
        metrics[mapping.targetField] = typedValue as number;
      }

      // Extract timestamp (first DATE dimension)
      if (mapping.fieldType === 'DATE' && timestamp === null) {
        timestamp =
          typedValue instanceof Date ? typedValue : new Date(typedValue as string);
      }
    }

    // Default timestamp to now if no date field mapped
    if (timestamp === null) {
      timestamp = new Date();
    }

    return { dimensions, metrics, timestamp };
  }

  coerceType(value: unknown, targetType: string): unknown {
    if (value === null || value === undefined) return null;

    switch (targetType.toUpperCase()) {
      case 'STRING':
        return String(value);
      case 'NUMBER': {
        const num = Number(value);
        return isNaN(num) ? null : num;
      }
      case 'DATE': {
        if (value instanceof Date) return value;
        const d = new Date(value as string);
        return isNaN(d.getTime()) ? null : d;
      }
      case 'BOOLEAN': {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          return ['true', '1', 'yes'].includes(value.toLowerCase());
        }
        return Boolean(value);
      }
      default:
        return value;
    }
  }

  private parseDateFormat(value: string, format: string): Date {
    if (format === 'X' || format === 'unix') {
      return new Date(Number(value) * 1000);
    }
    if (format === 'ISO8601' || format === 'iso8601') {
      return new Date(value);
    }
    // For YYYY-MM-DD and other formats, rely on Date.parse
    return new Date(value);
  }
}

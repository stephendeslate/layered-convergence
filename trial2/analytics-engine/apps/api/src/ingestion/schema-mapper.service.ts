import { Injectable } from '@nestjs/common';
import {
  FieldMapping,
  FieldMappingType,
  DataType,
  DataRecord,
} from '@analytics-engine/shared';

@Injectable()
export class SchemaMapperService {
  applyMapping(
    records: DataRecord[],
    mappings: FieldMapping[],
  ): { dimensions: Record<string, unknown>; metrics: Record<string, unknown>; timestamp: Date }[] {
    return records.map((record) => {
      const dimensions: Record<string, unknown> = {};
      const metrics: Record<string, unknown> = {};
      let timestamp: Date = new Date();

      for (const mapping of mappings) {
        const rawValue = this.extractValue(record, mapping.source, mapping.jsonPath);
        const castedValue = this.castValue(rawValue, mapping.dataType);

        if (mapping.dataType === DataType.DATE && mapping.type === FieldMappingType.DIMENSION) {
          if (castedValue !== null && castedValue !== undefined) {
            const parsed = castedValue instanceof Date ? castedValue : new Date(String(castedValue));
            if (!isNaN(parsed.getTime())) {
              timestamp = parsed;
              dimensions[mapping.target] = timestamp.toISOString();
            }
          }
          continue;
        }

        if (mapping.type === FieldMappingType.DIMENSION) {
          dimensions[mapping.target] = castedValue;
        } else if (mapping.type === FieldMappingType.METRIC) {
          metrics[mapping.target] = castedValue;
        }
      }

      return { dimensions, metrics, timestamp };
    });
  }

  private extractValue(record: DataRecord, source: string, jsonPath?: string): unknown {
    if (jsonPath) {
      return this.extractJsonPath(record, jsonPath);
    }
    if (source.includes('.')) {
      const parts = source.split('.');
      let current: unknown = record;
      for (const part of parts) {
        if (current === null || current === undefined || typeof current !== 'object') {
          return undefined;
        }
        current = (current as Record<string, unknown>)[part];
      }
      return current;
    }
    return record[source];
  }

  private extractJsonPath(obj: DataRecord, path: string): unknown {
    const cleanPath = path.startsWith('$.') ? path.slice(2) : path;
    const parts = cleanPath.split('.');
    let current: unknown = obj;
    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined;
      }
      const bracketMatch = part.match(/^(\w+)\[(\d+)\]$/);
      if (bracketMatch) {
        const [, key, index] = bracketMatch;
        current = (current as Record<string, unknown>)[key];
        if (Array.isArray(current)) {
          current = current[parseInt(index, 10)];
        } else {
          return undefined;
        }
      } else {
        current = (current as Record<string, unknown>)[part];
      }
    }
    return current;
  }

  private castValue(value: unknown, dataType: DataType): unknown {
    if (value === null || value === undefined) return null;

    switch (dataType) {
      case DataType.STRING:
        return String(value);
      case DataType.NUMBER: {
        const num = Number(value);
        return isNaN(num) ? null : num;
      }
      case DataType.DATE: {
        const date = new Date(value as string | number);
        return isNaN(date.getTime()) ? null : date;
      }
      case DataType.BOOLEAN:
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          return ['true', '1', 'yes'].includes(value.toLowerCase());
        }
        return Boolean(value);
      default:
        return value;
    }
  }
}

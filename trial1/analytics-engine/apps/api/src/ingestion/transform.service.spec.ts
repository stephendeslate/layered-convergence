import { describe, it, expect, beforeEach } from 'vitest';
import { TransformService } from './transform.service';

describe('TransformService', () => {
  let service: TransformService;

  beforeEach(() => {
    service = new TransformService();
  });

  describe('transform', () => {
    const fieldMappings = [
      {
        sourceField: 'region',
        targetField: 'region',
        fieldType: 'STRING',
        fieldRole: 'DIMENSION',
        isRequired: true,
      },
      {
        sourceField: 'revenue',
        targetField: 'revenue',
        fieldType: 'NUMBER',
        fieldRole: 'METRIC',
        isRequired: true,
      },
      {
        sourceField: 'date',
        targetField: 'date',
        fieldType: 'DATE',
        fieldRole: 'DIMENSION',
        isRequired: false,
      },
    ];

    it('should map raw records to dimensions and metrics', () => {
      const result = service.transform(
        [{ region: 'US', revenue: 1500, date: '2026-03-01' }],
        fieldMappings,
        [],
      );

      expect(result.records).toHaveLength(1);
      expect(result.records[0].dimensions).toEqual({
        region: 'US',
        date: expect.any(Date),
      });
      expect(result.records[0].metrics).toEqual({ revenue: 1500 });
      expect(result.records[0].timestamp).toBeInstanceOf(Date);
    });

    it('should send records with missing required fields to dead letter', () => {
      const result = service.transform(
        [
          { region: 'US', revenue: 1500 },
          { region: null, revenue: 1000 }, // required field is null
          { revenue: 800 }, // required field missing
        ],
        fieldMappings,
        [],
      );

      expect(result.records).toHaveLength(1);
      expect(result.deadLetters).toHaveLength(2);
    });

    it('should handle type coercion for NUMBER fields', () => {
      const result = service.transform(
        [{ region: 'US', revenue: '1500.50' }],
        fieldMappings,
        [],
      );

      expect(result.records).toHaveLength(1);
      expect(result.records[0].metrics.revenue).toBe(1500.5);
    });

    it('should dead-letter records with non-coercible values', () => {
      const result = service.transform(
        [{ region: 'US', revenue: 'not-a-number' }],
        fieldMappings,
        [],
      );

      expect(result.records).toHaveLength(0);
      expect(result.deadLetters).toHaveLength(1);
    });

    it('should default timestamp to now when no DATE field present', () => {
      const mappingsNoDate = [
        {
          sourceField: 'region',
          targetField: 'region',
          fieldType: 'STRING',
          fieldRole: 'DIMENSION',
          isRequired: true,
        },
        {
          sourceField: 'revenue',
          targetField: 'revenue',
          fieldType: 'NUMBER',
          fieldRole: 'METRIC',
          isRequired: true,
        },
      ];

      const before = new Date();
      const result = service.transform(
        [{ region: 'US', revenue: 100 }],
        mappingsNoDate,
        [],
      );

      expect(result.records[0].timestamp.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });
  });

  describe('transforms', () => {
    const fieldMappings = [
      {
        sourceField: 'name',
        targetField: 'name',
        fieldType: 'STRING',
        fieldRole: 'DIMENSION',
        isRequired: true,
      },
      {
        sourceField: 'amount',
        targetField: 'amount',
        fieldType: 'NUMBER',
        fieldRole: 'METRIC',
        isRequired: true,
      },
    ];

    it('should apply rename transform', () => {
      const result = service.transform(
        [{ full_name: 'Alice', amount: 100 }],
        fieldMappings,
        [{ type: 'rename', from: 'full_name', to: 'name' }],
      );

      expect(result.records).toHaveLength(1);
      expect(result.records[0].dimensions.name).toBe('Alice');
    });

    it('should apply cast transform', () => {
      const result = service.transform(
        [{ name: 'Alice', amount: '250' }],
        fieldMappings,
        [{ type: 'cast', field: 'amount', targetType: 'NUMBER' }],
      );

      expect(result.records).toHaveLength(1);
      expect(result.records[0].metrics.amount).toBe(250);
    });

    it('should apply default transform', () => {
      const mappings = [
        ...fieldMappings,
        {
          sourceField: 'region',
          targetField: 'region',
          fieldType: 'STRING',
          fieldRole: 'DIMENSION',
          isRequired: false,
        },
      ];
      const result = service.transform(
        [{ name: 'Alice', amount: 100 }],
        mappings,
        [{ type: 'default', field: 'region', value: 'US' }],
      );

      expect(result.records).toHaveLength(1);
      expect(result.records[0].dimensions.region).toBe('US');
    });

    it('should apply dateFormat transform', () => {
      const mappings = [
        ...fieldMappings,
        {
          sourceField: 'created',
          targetField: 'created',
          fieldType: 'DATE',
          fieldRole: 'DIMENSION',
          isRequired: false,
        },
      ];
      const result = service.transform(
        [{ name: 'Alice', amount: 100, created: '2026-03-15' }],
        mappings,
        [{ type: 'dateFormat', field: 'created', format: 'YYYY-MM-DD' }],
      );

      expect(result.records).toHaveLength(1);
      expect(result.records[0].timestamp).toBeInstanceOf(Date);
    });
  });

  describe('coerceType', () => {
    it('should coerce string to number', () => {
      expect(service.coerceType('42.5', 'NUMBER')).toBe(42.5);
    });

    it('should return null for non-numeric string', () => {
      expect(service.coerceType('abc', 'NUMBER')).toBeNull();
    });

    it('should coerce string to boolean', () => {
      expect(service.coerceType('true', 'BOOLEAN')).toBe(true);
      expect(service.coerceType('false', 'BOOLEAN')).toBe(false);
      expect(service.coerceType('yes', 'BOOLEAN')).toBe(true);
    });

    it('should coerce string to date', () => {
      const result = service.coerceType('2026-03-15', 'DATE');
      expect(result).toBeInstanceOf(Date);
    });

    it('should return null for invalid date', () => {
      const result = service.coerceType('not-a-date', 'DATE');
      expect(result).toBeNull();
    });
  });
});

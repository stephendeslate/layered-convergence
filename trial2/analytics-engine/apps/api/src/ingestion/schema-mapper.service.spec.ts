import { SchemaMapperService } from './schema-mapper.service';
import { FieldMapping, FieldMappingType, DataType } from '@analytics-engine/shared';

describe('SchemaMapperService', () => {
  let service: SchemaMapperService;

  beforeEach(() => {
    service = new SchemaMapperService();
  });

  const mappings: FieldMapping[] = [
    { source: 'date', target: 'timestamp', type: FieldMappingType.DIMENSION, dataType: DataType.DATE },
    { source: 'revenue', target: 'revenue', type: FieldMappingType.METRIC, dataType: DataType.NUMBER },
    { source: 'region', target: 'region', type: FieldMappingType.DIMENSION, dataType: DataType.STRING },
  ];

  it('should map records to dimensions and metrics', () => {
    const records = [
      { date: '2024-01-15T00:00:00Z', revenue: 1500, region: 'North' },
      { date: '2024-01-16T00:00:00Z', revenue: 2000, region: 'South' },
    ];

    const result = service.applyMapping(records, mappings);

    expect(result).toHaveLength(2);
    expect(result[0].metrics).toEqual({ revenue: 1500 });
    expect(result[0].dimensions.region).toBe('North');
    expect(result[0].timestamp).toBeInstanceOf(Date);
  });

  it('should handle nested source fields', () => {
    const nestedMappings: FieldMapping[] = [
      { source: 'data.amount', target: 'amount', type: FieldMappingType.METRIC, dataType: DataType.NUMBER },
    ];

    const records = [{ data: { amount: 42 } }];
    const result = service.applyMapping(records, nestedMappings);

    expect(result[0].metrics.amount).toBe(42);
  });

  it('should handle jsonPath extraction', () => {
    const jsonPathMappings: FieldMapping[] = [
      {
        source: 'items',
        target: 'value',
        type: FieldMappingType.METRIC,
        dataType: DataType.NUMBER,
        jsonPath: '$.results.value',
      },
    ];

    const records = [{ results: { value: 99 } }];
    const result = service.applyMapping(records, jsonPathMappings);

    expect(result[0].metrics.value).toBe(99);
  });

  it('should cast string numbers to actual numbers', () => {
    const castMappings: FieldMapping[] = [
      { source: 'amount', target: 'amount', type: FieldMappingType.METRIC, dataType: DataType.NUMBER },
    ];

    const records = [{ amount: '123.45' }];
    const result = service.applyMapping(records, castMappings);

    expect(result[0].metrics.amount).toBe(123.45);
  });

  it('should handle null/undefined values gracefully', () => {
    const records = [{ region: 'North' }];
    const result = service.applyMapping(records, mappings);

    expect(result[0].metrics.revenue).toBeNull();
  });
});

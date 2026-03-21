import { TransformService } from './transform.service';
import { TransformType, DataType, FilterOperator, TransformStep } from '@analytics-engine/shared';

describe('TransformService', () => {
  let service: TransformService;

  beforeEach(() => {
    service = new TransformService();
  });

  it('should rename fields', () => {
    const records = [{ old_name: 'value1' }, { old_name: 'value2' }];
    const steps: TransformStep[] = [
      { type: TransformType.RENAME, source: 'old_name', target: 'new_name' },
    ];

    const result = service.apply(records, steps);

    expect(result[0]).toHaveProperty('new_name', 'value1');
    expect(result[0]).not.toHaveProperty('old_name');
  });

  it('should cast fields', () => {
    const records = [{ amount: '42.5' }];
    const steps: TransformStep[] = [
      { type: TransformType.CAST, field: 'amount', toType: DataType.NUMBER },
    ];

    const result = service.apply(records, steps);
    expect(result[0].amount).toBe(42.5);
  });

  it('should derive computed fields', () => {
    const records = [{ price: 100, quantity: 5 }];
    const steps: TransformStep[] = [
      { type: TransformType.DERIVE, field: 'total', expression: '{price} * {quantity}' },
    ];

    const result = service.apply(records, steps);
    expect(result[0].total).toBe(500);
  });

  it('should filter records', () => {
    const records = [
      { status: 'active', value: 10 },
      { status: 'inactive', value: 20 },
      { status: 'active', value: 30 },
    ];
    const steps: TransformStep[] = [
      { type: TransformType.FILTER, field: 'status', operator: FilterOperator.EQ, value: 'active' },
    ];

    const result = service.apply(records, steps);
    expect(result).toHaveLength(2);
    expect(result.every((r) => r.status === 'active')).toBe(true);
  });

  it('should apply multiple steps in order', () => {
    const records = [
      { old_revenue: '1500', region: 'North' },
      { old_revenue: '500', region: 'South' },
    ];
    const steps: TransformStep[] = [
      { type: TransformType.RENAME, source: 'old_revenue', target: 'revenue' },
      { type: TransformType.CAST, field: 'revenue', toType: DataType.NUMBER },
      { type: TransformType.FILTER, field: 'revenue', operator: FilterOperator.GT, value: 1000 },
    ];

    const result = service.apply(records, steps);
    expect(result).toHaveLength(1);
    expect(result[0].revenue).toBe(1500);
  });

  it('should reject unsafe expressions', () => {
    const records = [{ x: 1 }];
    const steps: TransformStep[] = [
      { type: TransformType.DERIVE, field: 'hack', expression: 'process.exit()' },
    ];

    const result = service.apply(records, steps);
    expect(result[0].hack).toBeNull();
  });
});

import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateWorkOrderDto } from './create-work-order.dto';

describe('CreateWorkOrderDto', () => {
  it('should pass with valid data', async () => {
    const dto = plainToInstance(CreateWorkOrderDto, {
      customerId: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Fix leaky faucet',
      serviceType: 'plumbing',
      address: '123 Main St',
      lat: 30.2672,
      lng: -97.7431,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail without required fields', async () => {
    const dto = plainToInstance(CreateWorkOrderDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with invalid UUID', async () => {
    const dto = plainToInstance(CreateWorkOrderDto, {
      customerId: 'not-a-uuid',
      title: 'Test',
      serviceType: 'plumbing',
      address: '123 Main St',
      lat: 30.0,
      lng: -97.0,
    });

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'customerId')).toBe(true);
  });

  it('should fail with out-of-range lat/lng', async () => {
    const dto = plainToInstance(CreateWorkOrderDto, {
      customerId: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test',
      serviceType: 'plumbing',
      address: '123 Main St',
      lat: 200,
      lng: -300,
    });

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'lat')).toBe(true);
    expect(errors.some((e) => e.property === 'lng')).toBe(true);
  });
});

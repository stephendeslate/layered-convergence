import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateCustomerDto } from './create-customer.dto';

describe('CreateCustomerDto', () => {
  it('should pass with valid data', async () => {
    const dto = plainToInstance(CreateCustomerDto, {
      name: 'Bob Wilson',
      address: '123 Main St, Austin, TX',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass with all optional fields', async () => {
    const dto = plainToInstance(CreateCustomerDto, {
      name: 'Bob Wilson',
      email: 'bob@example.com',
      phone: '512-555-0100',
      address: '123 Main St, Austin, TX',
      lat: 30.2672,
      lng: -97.7431,
      notes: 'VIP customer',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail without required name', async () => {
    const dto = plainToInstance(CreateCustomerDto, {
      address: '123 Main St',
    });

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('should fail without required address', async () => {
    const dto = plainToInstance(CreateCustomerDto, {
      name: 'Bob Wilson',
    });

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'address')).toBe(true);
  });
});

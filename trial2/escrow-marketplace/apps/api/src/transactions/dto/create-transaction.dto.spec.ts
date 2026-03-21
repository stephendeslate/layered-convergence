import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateTransactionDto } from './create-transaction.dto';

describe('CreateTransactionDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(CreateTransactionDto, {
      providerId: '550e8400-e29b-41d4-a716-446655440000',
      amount: 1000,
      description: 'Test payment for services',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with amount below minimum', async () => {
    const dto = plainToInstance(CreateTransactionDto, {
      providerId: '550e8400-e29b-41d4-a716-446655440000',
      amount: 50,
      description: 'Test payment',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('amount');
  });

  it('should fail with non-UUID providerId', async () => {
    const dto = plainToInstance(CreateTransactionDto, {
      providerId: 'not-a-uuid',
      amount: 1000,
      description: 'Test payment',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('providerId');
  });

  it('should fail with short description', async () => {
    const dto = plainToInstance(CreateTransactionDto, {
      providerId: '550e8400-e29b-41d4-a716-446655440000',
      amount: 1000,
      description: 'ab',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('description');
  });
});

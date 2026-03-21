import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateDisputeDto } from './create-dispute.dto';

describe('CreateDisputeDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(CreateDisputeDto, {
      transactionId: '550e8400-e29b-41d4-a716-446655440000',
      reason: 'SERVICE_NOT_DELIVERED',
      description: 'The service was never provided despite payment being made.',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid reason', async () => {
    const dto = plainToInstance(CreateDisputeDto, {
      transactionId: '550e8400-e29b-41d4-a716-446655440000',
      reason: 'INVALID_REASON',
      description: 'The service was never provided.',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('reason');
  });

  it('should fail with short description', async () => {
    const dto = plainToInstance(CreateDisputeDto, {
      transactionId: '550e8400-e29b-41d4-a716-446655440000',
      reason: 'SERVICE_NOT_DELIVERED',
      description: 'short',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('description');
  });
});

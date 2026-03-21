import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateTechnicianDto } from './create-technician.dto';

describe('CreateTechnicianDto', () => {
  it('should pass with valid data', async () => {
    const dto = plainToInstance(CreateTechnicianDto, {
      name: 'John Smith',
      email: 'john@example.com',
      skills: ['plumbing', 'drain-cleaning'],
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail without skills', async () => {
    const dto = plainToInstance(CreateTechnicianDto, {
      name: 'John Smith',
      email: 'john@example.com',
      skills: [],
    });

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'skills')).toBe(true);
  });

  it('should fail with invalid email', async () => {
    const dto = plainToInstance(CreateTechnicianDto, {
      name: 'John Smith',
      email: 'not-an-email',
      skills: ['plumbing'],
    });

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });
});

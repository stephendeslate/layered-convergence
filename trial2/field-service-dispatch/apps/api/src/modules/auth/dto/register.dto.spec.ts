import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  it('should pass with valid data', async () => {
    const dto = plainToInstance(RegisterDto, {
      companyName: 'Acme Plumbing',
      email: 'admin@acme.com',
      password: 'securepass123',
      firstName: 'Alice',
      lastName: 'Admin',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail with short password', async () => {
    const dto = plainToInstance(RegisterDto, {
      companyName: 'Acme',
      email: 'admin@acme.com',
      password: 'short',
      firstName: 'Alice',
      lastName: 'Admin',
    });

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('should fail with invalid email', async () => {
    const dto = plainToInstance(RegisterDto, {
      companyName: 'Acme',
      email: 'not-an-email',
      password: 'securepass123',
      firstName: 'Alice',
      lastName: 'Admin',
    });

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('should fail without required fields', async () => {
    const dto = plainToInstance(RegisterDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

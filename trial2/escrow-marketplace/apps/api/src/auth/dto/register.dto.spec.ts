import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
      role: 'BUYER',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid email', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: 'not-an-email',
      password: 'Password123!',
      name: 'Test User',
      role: 'BUYER',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should fail with short password', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: 'test@example.com',
      password: 'short',
      name: 'Test User',
      role: 'BUYER',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });

  it('should fail with invalid role', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
      role: 'INVALID',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('role');
  });
});

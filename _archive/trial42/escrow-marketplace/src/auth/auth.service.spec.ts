import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<Record<keyof UsersService, any>>;
  let jwtService: Partial<Record<keyof JwtService, any>>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'BUYER',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012',
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: vi.fn(),
      create: vi.fn(),
    };
    jwtService = {
      sign: vi.fn().mockReturnValue('jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result.token).toBe('jwt-token');
      expect(result.user.email).toBe('test@example.com');
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          name: 'Test User',
          passwordHash: expect.any(String),
        }),
      );
    });

    it('should throw ConflictException if email exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash the password before creating user', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);

      await service.register({
        email: 'test@example.com',
        password: 'mypassword',
        name: 'Test',
      });

      const createCall = usersService.create.mock.calls[0][0];
      expect(createCall.passwordHash).not.toBe('mypassword');
      expect(createCall.passwordHash).toMatch(/^\$2[aby]\$/);
    });

    it('should pass role to create if provided', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue({ ...mockUser, role: 'PROVIDER' });

      await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        role: 'PROVIDER',
      });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'PROVIDER' }),
      );
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'bad@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      const bcrypt = await import('bcrypt');
      const hash = await bcrypt.hash('correctpassword', 10);
      usersService.findByEmail.mockResolvedValue({ ...mockUser, passwordHash: hash });

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token on valid credentials', async () => {
      const bcrypt = await import('bcrypt');
      const hash = await bcrypt.hash('password123', 10);
      usersService.findByEmail.mockResolvedValue({ ...mockUser, passwordHash: hash });

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.token).toBe('jwt-token');
      expect(result.user.id).toBe('user-1');
    });

    it('should sign JWT with correct payload', async () => {
      const bcrypt = await import('bcrypt');
      const hash = await bcrypt.hash('pass', 10);
      usersService.findByEmail.mockResolvedValue({ ...mockUser, passwordHash: hash });

      await service.login({ email: 'test@example.com', password: 'pass' });

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'test@example.com',
        role: 'BUYER',
      });
    });
  });
});

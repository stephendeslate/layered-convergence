import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<Record<keyof UsersService, any>>;
  let jwtService: Partial<Record<keyof JwtService, any>>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'BUYER',
    passwordHash: 'hashed-password',
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
    it('should register a new user', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as any).mockResolvedValue('hashed');
      usersService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result.token).toBe('jwt-token');
      expect(result.user.email).toBe('test@example.com');
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
      (bcrypt.hash as any).mockResolvedValue('hashed-pw');
      usersService.create.mockResolvedValue(mockUser);

      await service.register({
        email: 'test@example.com',
        password: 'mypassword',
        name: 'Test',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('mypassword', 10);
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: 'hashed-pw' }),
      );
    });

    it('should pass role to create if provided', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as any).mockResolvedValue('hashed-pw');
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
    it('should return token on valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.token).toBe('jwt-token');
      expect(result.user.id).toBe('user-1');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'bad@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should sign JWT with correct payload', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);

      await service.login({ email: 'test@example.com', password: 'pass' });

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'test@example.com',
        role: 'BUYER',
      });
    });
  });
});

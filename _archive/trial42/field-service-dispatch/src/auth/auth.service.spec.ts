import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };
    jwtService = {
      signAsync: vi.fn().mockResolvedValue('test-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto = { email: 'new@test.com', password: 'password123', name: 'Test', companyId: 'c1' };
      prisma.user.findUnique.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      prisma.user.create.mockResolvedValue({
        id: 'u1', email: dto.email, name: dto.name, companyId: dto.companyId, role: 'DISPATCHER',
      });

      const result = await service.register(dto);

      expect(result.accessToken).toBe('test-jwt-token');
      expect(result.user.email).toBe(dto.email);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ email: dto.email, password: 'hashed' }),
      });
    });

    it('should throw ConflictException if email exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(
        service.register({ email: 'taken@test.com', password: 'pass123', name: 'T', companyId: 'c1' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash password before storing', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-pw' as never);
      prisma.user.create.mockResolvedValue({
        id: 'u1', email: 'a@b.com', name: 'T', companyId: 'c1', role: 'DISPATCHER',
      });

      await service.register({ email: 'a@b.com', password: 'secret', name: 'T', companyId: 'c1' });

      expect(bcrypt.hash).toHaveBeenCalledWith('secret', 10);
    });
  });

  describe('login', () => {
    it('should return token on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1', email: 'test@test.com', password: 'hashed', companyId: 'c1', role: 'ADMIN', name: 'T',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login({ email: 'test@test.com', password: 'pass12' });

      expect(result.accessToken).toBe('test-jwt-token');
    });

    it('should throw UnauthorizedException on wrong email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ email: 'wrong@test.com', password: 'pass12' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1', email: 'test@test.com', password: 'hashed', companyId: 'c1', role: 'ADMIN',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
      await expect(service.login({ email: 'test@test.com', password: 'wrong1' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should include user info in response', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1', email: 'test@test.com', password: 'hashed', companyId: 'c1', role: 'ADMIN', name: 'Admin',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login({ email: 'test@test.com', password: 'pass12' });

      expect(result.user.id).toBe('u1');
      expect(result.user.role).toBe('ADMIN');
    });
  });
});

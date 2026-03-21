import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma.service';

// TRACED: EM-TA-UNIT-001 — Auth service unit tests
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock; create: jest.Mock } };
  let jwt: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = { user: { findFirst: jest.fn(), create: jest.fn() } };
    jwt = { sign: jest.fn().mockReturnValue('mock-token') };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('should reject ADMIN role registration', async () => {
    await expect(
      service.register({ email: 'a@b.com', password: 'pass12345', name: 'T', tenantId: 't1', role: 'ADMIN' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject duplicate email', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: '1' });
    await expect(
      service.register({ email: 'a@b.com', password: 'pass12345', name: 'T', tenantId: 't1', role: 'BUYER' }),
    ).rejects.toThrow(ConflictException);
  });

  it('should hash with salt 12 and return token', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    prisma.user.create.mockResolvedValue({ id: '1', tenantId: 't1', role: 'BUYER' });
    const result = await service.register({ email: 'new@b.com', password: 'pass12345', name: 'N', tenantId: 't1', role: 'BUYER' });
    expect(bcrypt.hash).toHaveBeenCalledWith('pass12345', 12);
    expect(result).toEqual({ access_token: 'mock-token' });
  });

  it('should reject invalid login', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(service.login({ email: 'no@b.com', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
  });
});

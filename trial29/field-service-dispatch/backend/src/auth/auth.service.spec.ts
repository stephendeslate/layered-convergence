import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma = {
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const mockJwt = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should hash password with salt 12 and create user', async () => {
      const dto = {
        email: 'tech@summit.com',
        password: 'SecureP@ss1',
        role: 'TECHNICIAN' as const,
        companyId: 'company-1',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: dto.email,
        role: dto.role,
        passwordHash: 'hashed-password',
      });
      mockJwt.signAsync.mockResolvedValue('jwt-token');

      const result = await service.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('SecureP@ss1', 12);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          passwordHash: 'hashed-password',
          role: dto.role,
          companyId: dto.companyId,
        },
      });
      expect(result).toEqual({ access_token: 'jwt-token' });
    });

    it('should generate JWT with correct payload', async () => {
      const dto = {
        email: 'dispatcher@summit.com',
        password: 'SecureP@ss1',
        role: 'DISPATCHER' as const,
        companyId: 'company-1',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-2',
        email: dto.email,
        role: dto.role,
      });
      mockJwt.signAsync.mockResolvedValue('token');

      await service.register(dto);

      expect(mockJwt.signAsync).toHaveBeenCalledWith({
        sub: 'user-2',
        email: dto.email,
        role: 'DISPATCHER',
      });
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'tech@summit.com',
        role: 'TECHNICIAN',
        passwordHash: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwt.signAsync.mockResolvedValue('jwt-token');

      const result = await service.login('tech@summit.com', 'SecureP@ss1');
      expect(result).toEqual({ access_token: 'jwt-token' });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login('missing@summit.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'tech@summit.com',
        role: 'TECHNICIAN',
        passwordHash: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('tech@summit.com', 'wrongpass1'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});

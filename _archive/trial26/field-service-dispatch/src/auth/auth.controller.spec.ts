import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Reflector } from '@nestjs/core';

const mockService = {
  register: vi.fn(),
  login: vi.fn(),
  validateUser: vi.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockService },
        Reflector,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call register', async () => {
    mockService.register.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
      token: 'tok',
    });

    const result = await controller.register({
      email: 'test@test.com',
      password: 'pass',
      name: 'Test',
      companyId: 'comp-1',
    });

    expect(result.token).toBe('tok');
    expect(mockService.register).toHaveBeenCalled();
  });

  it('should call login', async () => {
    mockService.login.mockResolvedValue({
      user: { id: '1' },
      token: 'tok',
    });

    const result = await controller.login({
      email: 'test@test.com',
      password: 'pass',
    });

    expect(result.token).toBe('tok');
  });

  it('should call validateUser for /me', async () => {
    mockService.validateUser.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
    });

    const req = { user: { userId: '1' } };
    const result = await controller.me(req);

    expect(result.email).toBe('test@test.com');
    expect(mockService.validateUser).toHaveBeenCalledWith('1');
  });
});

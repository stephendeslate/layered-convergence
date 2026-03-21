import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { register: jest.Mock; login: jest.Mock; validateUser: jest.Mock };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      validateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        role: Role.DISPATCHER,
        companySlug: 'test',
      };
      const expected = {
        token: 'token',
        user: { id: '1', email: 'test@example.com', role: Role.DISPATCHER, companyId: 'c1' },
      };
      authService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const expected = {
        token: 'token',
        user: { id: '1', email: 'test@example.com', role: Role.DISPATCHER, companyId: 'c1' },
      };
      authService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('me', () => {
    it('should return current user', async () => {
      const user = { id: '1', email: 'test@example.com', role: 'DISPATCHER', companyId: 'c1' };
      authService.validateUser.mockResolvedValue(user);

      const result = await controller.me({ user });
      expect(result).toEqual(user);
    });
  });
});

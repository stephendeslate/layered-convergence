import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  beforeEach(async () => {
    authService = {
      register: vi.fn().mockResolvedValue({ user: { id: '1' }, token: 'tok' }),
      login: vi.fn().mockResolvedValue({ user: { id: '1' }, token: 'tok' }),
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

  it('should call register on auth service', async () => {
    const dto = { email: 'a@b.com', password: 'pass1234', name: 'A' };
    await controller.register(dto);
    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('should call login on auth service', async () => {
    const dto = { email: 'a@b.com', password: 'pass1234' };
    await controller.login(dto);
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('should return register result', async () => {
    const result = await controller.register({ email: 'a@b.com', password: 'pass1234', name: 'A' });
    expect(result).toHaveProperty('token');
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: any;

  beforeEach(async () => {
    usersService = {
      findById: vi.fn(),
      findAll: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        Reflector,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile for authenticated user', async () => {
      const user = { id: 'user-1', email: 'test@test.com', name: 'Test' };
      usersService.findById.mockResolvedValue(user);

      const result = await controller.getProfile({ user: { id: 'user-1' } });
      expect(result).toEqual(user);
      expect(usersService.findById).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [{ id: '1' }, { id: '2' }];
      usersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();
      expect(result).toEqual(users);
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const user = { id: 'user-1' };
      usersService.findById.mockResolvedValue(user);

      const result = await controller.findById('user-1');
      expect(result).toEqual(user);
    });
  });
});

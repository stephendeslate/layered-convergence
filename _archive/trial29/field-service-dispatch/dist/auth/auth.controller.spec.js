"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _authcontroller = require("./auth.controller");
const _authservice = require("./auth.service");
const mockService = {
    register: _vitest.vi.fn(),
    login: _vitest.vi.fn(),
    validateUser: _vitest.vi.fn()
};
(0, _vitest.describe)('AuthController', ()=>{
    let controller;
    (0, _vitest.beforeEach)(async ()=>{
        _vitest.vi.clearAllMocks();
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _authcontroller.AuthController
            ],
            providers: [
                {
                    provide: _authservice.AuthService,
                    useValue: mockService
                }
            ]
        }).compile();
        controller = module.get(_authcontroller.AuthController);
    });
    (0, _vitest.it)('should be defined', ()=>{
        (0, _vitest.expect)(controller).toBeDefined();
    });
    (0, _vitest.it)('should call register', async ()=>{
        const dto = {
            email: 'test@test.com',
            name: 'Test',
            password: 'pass',
            companyId: 'c1'
        };
        mockService.register.mockResolvedValue({
            user: {
                id: 'u1'
            },
            token: 'tok'
        });
        const result = await controller.register(dto);
        (0, _vitest.expect)(mockService.register).toHaveBeenCalledWith(dto);
        (0, _vitest.expect)(result.token).toBe('tok');
    });
    (0, _vitest.it)('should call login', async ()=>{
        const dto = {
            email: 'test@test.com',
            password: 'pass'
        };
        mockService.login.mockResolvedValue({
            user: {
                id: 'u1'
            },
            token: 'tok'
        });
        const result = await controller.login(dto);
        (0, _vitest.expect)(mockService.login).toHaveBeenCalledWith(dto);
        (0, _vitest.expect)(result.token).toBe('tok');
    });
    (0, _vitest.it)('should call validateUser for me endpoint', async ()=>{
        mockService.validateUser.mockResolvedValue({
            id: 'u1'
        });
        const req = {
            user: {
                userId: 'u1'
            }
        };
        const result = await controller.me(req);
        (0, _vitest.expect)(mockService.validateUser).toHaveBeenCalledWith('u1');
        (0, _vitest.expect)(result.id).toBe('u1');
    });
});

//# sourceMappingURL=auth.controller.spec.js.map
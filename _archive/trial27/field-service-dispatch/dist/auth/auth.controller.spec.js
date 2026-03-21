"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _authcontroller = require("./auth.controller");
const _authservice = require("./auth.service");
const _core = require("@nestjs/core");
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
                },
                _core.Reflector
            ]
        }).compile();
        controller = module.get(_authcontroller.AuthController);
    });
    (0, _vitest.it)('should be defined', ()=>{
        (0, _vitest.expect)(controller).toBeDefined();
    });
    (0, _vitest.it)('should call register', async ()=>{
        mockService.register.mockResolvedValue({
            user: {
                id: '1',
                email: 'test@test.com'
            },
            token: 'tok'
        });
        const result = await controller.register({
            email: 'test@test.com',
            password: 'pass',
            name: 'Test',
            companyId: 'comp-1'
        });
        (0, _vitest.expect)(result.token).toBe('tok');
        (0, _vitest.expect)(mockService.register).toHaveBeenCalled();
    });
    (0, _vitest.it)('should call login', async ()=>{
        mockService.login.mockResolvedValue({
            user: {
                id: '1'
            },
            token: 'tok'
        });
        const result = await controller.login({
            email: 'test@test.com',
            password: 'pass'
        });
        (0, _vitest.expect)(result.token).toBe('tok');
    });
    (0, _vitest.it)('should call validateUser for /me', async ()=>{
        mockService.validateUser.mockResolvedValue({
            id: '1',
            email: 'test@test.com'
        });
        const req = {
            user: {
                userId: '1'
            }
        };
        const result = await controller.me(req);
        (0, _vitest.expect)(result.email).toBe('test@test.com');
        (0, _vitest.expect)(mockService.validateUser).toHaveBeenCalledWith('1');
    });
});

//# sourceMappingURL=auth.controller.spec.js.map
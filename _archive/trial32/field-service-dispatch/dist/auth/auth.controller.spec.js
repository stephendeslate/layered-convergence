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
        _vitest.vi.clearAllMocks();
    });
    (0, _vitest.it)('should be defined', ()=>{
        (0, _vitest.expect)(controller).toBeDefined();
    });
    (0, _vitest.it)('should call register', async ()=>{
        const dto = {
            email: 'test@test.com',
            password: 'pass',
            name: 'Test',
            companyId: 'c1'
        };
        mockService.register.mockResolvedValue({
            user: {
                id: '1'
            },
            token: 'tok'
        });
        const result = await controller.register(dto);
        (0, _vitest.expect)(result.token).toBe('tok');
    });
    (0, _vitest.it)('should call login', async ()=>{
        const dto = {
            email: 'test@test.com',
            password: 'pass'
        };
        mockService.login.mockResolvedValue({
            user: {
                id: '1'
            },
            token: 'tok'
        });
        const result = await controller.login(dto);
        (0, _vitest.expect)(result.token).toBe('tok');
    });
    (0, _vitest.it)('should call me', async ()=>{
        mockService.validateUser.mockResolvedValue({
            id: '1'
        });
        const result = await controller.me({
            user: {
                userId: '1'
            }
        });
        (0, _vitest.expect)(result.id).toBe('1');
    });
});

//# sourceMappingURL=auth.controller.spec.js.map
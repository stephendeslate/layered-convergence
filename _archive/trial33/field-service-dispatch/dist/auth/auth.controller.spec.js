"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _authcontroller = require("./auth.controller");
(0, _vitest.describe)('AuthController', ()=>{
    let controller;
    let authService;
    (0, _vitest.beforeEach)(()=>{
        authService = {
            register: _vitest.vi.fn(),
            login: _vitest.vi.fn(),
            validateUser: _vitest.vi.fn()
        };
        controller = new _authcontroller.AuthController(authService);
    });
    (0, _vitest.describe)('register', ()=>{
        (0, _vitest.it)('should call authService.register with dto', async ()=>{
            const dto = {
                email: 'test@example.com',
                password: 'password123',
                name: 'Test',
                companyId: 'company-1'
            };
            const result = {
                user: {
                    id: 'user-1'
                },
                token: 'tok'
            };
            authService.register.mockResolvedValue(result);
            (0, _vitest.expect)(await controller.register(dto)).toEqual(result);
            (0, _vitest.expect)(authService.register).toHaveBeenCalledWith(dto);
        });
    });
    (0, _vitest.describe)('login', ()=>{
        (0, _vitest.it)('should call authService.login with dto', async ()=>{
            const dto = {
                email: 'test@example.com',
                password: 'password123'
            };
            const result = {
                user: {
                    id: 'user-1'
                },
                token: 'tok'
            };
            authService.login.mockResolvedValue(result);
            (0, _vitest.expect)(await controller.login(dto)).toEqual(result);
            (0, _vitest.expect)(authService.login).toHaveBeenCalledWith(dto);
        });
    });
    (0, _vitest.describe)('me', ()=>{
        (0, _vitest.it)('should call authService.validateUser with userId from request', async ()=>{
            const req = {
                user: {
                    userId: 'user-1'
                }
            };
            const result = {
                id: 'user-1',
                email: 'test@example.com'
            };
            authService.validateUser.mockResolvedValue(result);
            (0, _vitest.expect)(await controller.me(req)).toEqual(result);
            (0, _vitest.expect)(authService.validateUser).toHaveBeenCalledWith('user-1');
        });
    });
});

//# sourceMappingURL=auth.controller.spec.js.map
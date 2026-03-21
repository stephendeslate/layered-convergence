"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _authcontroller = require("./auth.controller");
const _authservice = require("./auth.service");
describe('AuthController', ()=>{
    let controller;
    let authService;
    beforeEach(async ()=>{
        authService = {
            register: vi.fn().mockResolvedValue({
                user: {
                    id: '1'
                },
                token: 'tok'
            }),
            login: vi.fn().mockResolvedValue({
                user: {
                    id: '1'
                },
                token: 'tok'
            })
        };
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _authcontroller.AuthController
            ],
            providers: [
                {
                    provide: _authservice.AuthService,
                    useValue: authService
                }
            ]
        }).compile();
        controller = module.get(_authcontroller.AuthController);
    });
    it('should be defined', ()=>{
        expect(controller).toBeDefined();
    });
    it('should call register on auth service', async ()=>{
        const dto = {
            email: 'a@b.com',
            password: 'pass1234',
            name: 'A'
        };
        await controller.register(dto);
        expect(authService.register).toHaveBeenCalledWith(dto);
    });
    it('should call login on auth service', async ()=>{
        const dto = {
            email: 'a@b.com',
            password: 'pass1234'
        };
        await controller.login(dto);
        expect(authService.login).toHaveBeenCalledWith(dto);
    });
    it('should return register result', async ()=>{
        const result = await controller.register({
            email: 'a@b.com',
            password: 'pass1234',
            name: 'A'
        });
        expect(result).toHaveProperty('token');
    });
});

//# sourceMappingURL=auth.controller.spec.js.map
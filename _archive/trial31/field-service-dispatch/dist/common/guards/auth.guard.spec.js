"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _core = require("@nestjs/core");
const _common = require("@nestjs/common");
const _authguard = require("./auth.guard");
(0, _vitest.describe)('AuthGuard', ()=>{
    let guard;
    let reflector;
    (0, _vitest.beforeEach)(async ()=>{
        const module = await _testing.Test.createTestingModule({
            providers: [
                _authguard.AuthGuard,
                _core.Reflector
            ]
        }).compile();
        guard = module.get(_authguard.AuthGuard);
        reflector = module.get(_core.Reflector);
    });
    const createContext = (headers = {})=>({
            switchToHttp: ()=>({
                    getRequest: ()=>({
                            headers,
                            user: undefined
                        })
                }),
            getHandler: ()=>({}),
            getClass: ()=>({})
        });
    (0, _vitest.it)('should allow public routes', ()=>{
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
        const ctx = createContext();
        (0, _vitest.expect)(guard.canActivate(ctx)).toBe(true);
    });
    (0, _vitest.it)('should throw UnauthorizedException when no auth header', ()=>{
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        const ctx = createContext({});
        (0, _vitest.expect)(()=>guard.canActivate(ctx)).toThrow(_common.UnauthorizedException);
    });
    (0, _vitest.it)('should throw when token is not Bearer', ()=>{
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        const ctx = createContext({
            authorization: 'Basic abc'
        });
        (0, _vitest.expect)(()=>guard.canActivate(ctx)).toThrow(_common.UnauthorizedException);
    });
    (0, _vitest.it)('should parse valid token and set user on request', ()=>{
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        const payload = {
            sub: '1',
            email: 'test@test.com',
            role: 'ADMIN',
            companyId: 'c1'
        };
        const token = `header.${Buffer.from(JSON.stringify(payload)).toString('base64')}.sig`;
        const request = {
            headers: {
                authorization: `Bearer ${token}`
            },
            user: undefined
        };
        const ctx = {
            switchToHttp: ()=>({
                    getRequest: ()=>request
                }),
            getHandler: ()=>({}),
            getClass: ()=>({})
        };
        (0, _vitest.expect)(guard.canActivate(ctx)).toBe(true);
        (0, _vitest.expect)(request.user.userId).toBe('1');
        (0, _vitest.expect)(request.user.companyId).toBe('c1');
    });
    (0, _vitest.it)('should throw for invalid token payload', ()=>{
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        const ctx = createContext({
            authorization: 'Bearer invalid.token.here'
        });
        (0, _vitest.expect)(()=>guard.canActivate(ctx)).toThrow(_common.UnauthorizedException);
    });
});

//# sourceMappingURL=auth.guard.spec.js.map
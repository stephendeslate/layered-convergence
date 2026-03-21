"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _common = require("@nestjs/common");
const _core = require("@nestjs/core");
const _authguard = require("./auth.guard");
(0, _vitest.describe)('AuthGuard', ()=>{
    let guard;
    let reflector;
    (0, _vitest.beforeEach)(()=>{
        reflector = new _core.Reflector();
        guard = new _authguard.AuthGuard(reflector);
    });
    const createContext = (headers = {})=>{
        const request = {
            headers,
            user: undefined
        };
        return {
            switchToHttp: ()=>({
                    getRequest: ()=>request
                }),
            getHandler: ()=>_vitest.vi.fn(),
            getClass: ()=>_vitest.vi.fn(),
            _request: request
        };
    };
    (0, _vitest.it)('should allow public routes', ()=>{
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
        const ctx = createContext();
        (0, _vitest.expect)(guard.canActivate(ctx)).toBe(true);
    });
    (0, _vitest.it)('should throw when no authorization header', ()=>{
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        const ctx = createContext({});
        (0, _vitest.expect)(()=>guard.canActivate(ctx)).toThrow(_common.UnauthorizedException);
    });
    (0, _vitest.it)('should throw when authorization header has no Bearer prefix', ()=>{
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        const ctx = createContext({
            authorization: 'Basic abc'
        });
        (0, _vitest.expect)(()=>guard.canActivate(ctx)).toThrow(_common.UnauthorizedException);
    });
    (0, _vitest.it)('should parse valid token and set request.user', ()=>{
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        const payload = {
            sub: 'u1',
            email: 'test@test.com',
            role: 'ADMIN',
            companyId: 'c1'
        };
        const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
        const token = `header.${encodedPayload}.signature`;
        const ctx = createContext({
            authorization: `Bearer ${token}`
        });
        (0, _vitest.expect)(guard.canActivate(ctx)).toBe(true);
        (0, _vitest.expect)(ctx._request.user).toEqual({
            userId: 'u1',
            email: 'test@test.com',
            role: 'ADMIN',
            companyId: 'c1'
        });
    });
    (0, _vitest.it)('should throw for invalid token format', ()=>{
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        const ctx = createContext({
            authorization: 'Bearer invalidtoken'
        });
        (0, _vitest.expect)(()=>guard.canActivate(ctx)).toThrow(_common.UnauthorizedException);
    });
});

//# sourceMappingURL=auth.guard.spec.js.map
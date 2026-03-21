"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _common = require("@nestjs/common");
const _core = require("@nestjs/core");
const _authguard = require("./auth.guard");
function createMockContext(headers = {}) {
    const request = {
        headers
    };
    return {
        switchToHttp: ()=>({
                getRequest: ()=>request
            }),
        getHandler: ()=>({}),
        getClass: ()=>({})
    };
}
function generateTestToken() {
    const header = Buffer.from(JSON.stringify({
        alg: 'HS256',
        typ: 'JWT'
    })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
        sub: 'user-1',
        email: 'test@test.com',
        role: 'ADMIN',
        companyId: 'comp-1'
    })).toString('base64url');
    return `${header}.${payload}.fakesig`;
}
(0, _vitest.describe)('AuthGuard', ()=>{
    (0, _vitest.it)('should allow public routes', ()=>{
        const reflector = new _core.Reflector();
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
        const guard = new _authguard.AuthGuard(reflector);
        const ctx = createMockContext();
        (0, _vitest.expect)(guard.canActivate(ctx)).toBe(true);
    });
    (0, _vitest.it)('should throw UnauthorizedException when no Authorization header', ()=>{
        const reflector = new _core.Reflector();
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        const guard = new _authguard.AuthGuard(reflector);
        const ctx = createMockContext({});
        (0, _vitest.expect)(()=>guard.canActivate(ctx)).toThrow(_common.UnauthorizedException);
    });
    (0, _vitest.it)('should throw UnauthorizedException when Bearer prefix missing', ()=>{
        const reflector = new _core.Reflector();
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        const guard = new _authguard.AuthGuard(reflector);
        const ctx = createMockContext({
            authorization: 'Basic abc'
        });
        (0, _vitest.expect)(()=>guard.canActivate(ctx)).toThrow(_common.UnauthorizedException);
    });
    (0, _vitest.it)('should throw UnauthorizedException for invalid token', ()=>{
        const reflector = new _core.Reflector();
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        const guard = new _authguard.AuthGuard(reflector);
        const ctx = createMockContext({
            authorization: 'Bearer not-a-valid-token'
        });
        (0, _vitest.expect)(()=>guard.canActivate(ctx)).toThrow(_common.UnauthorizedException);
    });
    (0, _vitest.it)('should parse valid token and set user on request', ()=>{
        const reflector = new _core.Reflector();
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        const guard = new _authguard.AuthGuard(reflector);
        const token = generateTestToken();
        const request = {
            headers: {
                authorization: `Bearer ${token}`
            }
        };
        const ctx = {
            switchToHttp: ()=>({
                    getRequest: ()=>request
                }),
            getHandler: ()=>({}),
            getClass: ()=>({})
        };
        (0, _vitest.expect)(guard.canActivate(ctx)).toBe(true);
        (0, _vitest.expect)(request.user.email).toBe('test@test.com');
        (0, _vitest.expect)(request.user.role).toBe('ADMIN');
        (0, _vitest.expect)(request.user.companyId).toBe('comp-1');
    });
});

//# sourceMappingURL=auth.guard.spec.js.map
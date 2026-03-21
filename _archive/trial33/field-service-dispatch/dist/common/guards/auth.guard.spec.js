"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _authguard = require("./auth.guard");
const _core = require("@nestjs/core");
const _common = require("@nestjs/common");
(0, _vitest.describe)('AuthGuard', ()=>{
    let guard;
    let reflector;
    function createContext(headers = {}, isPublic = false) {
        const request = {
            headers,
            user: undefined
        };
        reflector.getAllAndOverride = ()=>isPublic;
        return {
            switchToHttp: ()=>({
                    getRequest: ()=>request
                }),
            getHandler: ()=>({}),
            getClass: ()=>({})
        };
    }
    (0, _vitest.beforeEach)(()=>{
        reflector = new _core.Reflector();
        guard = new _authguard.AuthGuard(reflector);
    });
    (0, _vitest.it)('should allow access for public routes', ()=>{
        const context = createContext({}, true);
        (0, _vitest.expect)(guard.canActivate(context)).toBe(true);
    });
    (0, _vitest.it)('should throw UnauthorizedException when no authorization header', ()=>{
        const context = createContext({});
        (0, _vitest.expect)(()=>guard.canActivate(context)).toThrow(_common.UnauthorizedException);
    });
    (0, _vitest.it)('should throw UnauthorizedException for non-Bearer tokens', ()=>{
        const context = createContext({
            authorization: 'Basic abc123'
        });
        (0, _vitest.expect)(()=>guard.canActivate(context)).toThrow(_common.UnauthorizedException);
    });
    (0, _vitest.it)('should throw UnauthorizedException for invalid token payload', ()=>{
        const context = createContext({
            authorization: 'Bearer invalid.token.here'
        });
        (0, _vitest.expect)(()=>guard.canActivate(context)).toThrow(_common.UnauthorizedException);
    });
    (0, _vitest.it)('should parse valid Bearer token and set request.user', ()=>{
        const payload = {
            sub: 'user-1',
            email: 'test@example.com',
            role: 'ADMIN',
            companyId: 'company-1'
        };
        const header = Buffer.from(JSON.stringify({
            alg: 'HS256'
        })).toString('base64url');
        const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
        const token = `${header}.${payloadStr}.signature`;
        const request = {
            headers: {
                authorization: `Bearer ${token}`
            },
            user: undefined
        };
        reflector.getAllAndOverride = ()=>false;
        const context = {
            switchToHttp: ()=>({
                    getRequest: ()=>request
                }),
            getHandler: ()=>({}),
            getClass: ()=>({})
        };
        (0, _vitest.expect)(guard.canActivate(context)).toBe(true);
        (0, _vitest.expect)(request.user).toEqual({
            userId: 'user-1',
            email: 'test@example.com',
            role: 'ADMIN',
            companyId: 'company-1'
        });
    });
    (0, _vitest.it)('should have IS_PUBLIC_KEY exported', ()=>{
        (0, _vitest.expect)(_authguard.IS_PUBLIC_KEY).toBe('isPublic');
    });
});

//# sourceMappingURL=auth.guard.spec.js.map
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _common = require("@nestjs/common");
const _core = require("@nestjs/core");
const _rolesguard = require("./roles.guard");
(0, _vitest.describe)('RolesGuard', ()=>{
    let guard;
    let reflector;
    (0, _vitest.beforeEach)(()=>{
        reflector = new _core.Reflector();
        guard = new _rolesguard.RolesGuard(reflector);
    });
    const createContext = (user)=>{
        const request = {
            user
        };
        return {
            switchToHttp: ()=>({
                    getRequest: ()=>request
                }),
            getHandler: ()=>_vitest.vi.fn(),
            getClass: ()=>_vitest.vi.fn()
        };
    };
    (0, _vitest.it)('should allow when no roles required', ()=>{
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
        (0, _vitest.expect)(guard.canActivate(createContext())).toBe(true);
    });
    (0, _vitest.it)('should allow when empty roles array', ()=>{
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
        (0, _vitest.expect)(guard.canActivate(createContext())).toBe(true);
    });
    (0, _vitest.it)('should allow when user has required role', ()=>{
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
            'ADMIN'
        ]);
        (0, _vitest.expect)(guard.canActivate(createContext({
            role: 'ADMIN'
        }))).toBe(true);
    });
    (0, _vitest.it)('should throw ForbiddenException when user lacks role', ()=>{
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
            'ADMIN'
        ]);
        (0, _vitest.expect)(()=>guard.canActivate(createContext({
                role: 'DISPATCHER'
            }))).toThrow(_common.ForbiddenException);
    });
    (0, _vitest.it)('should throw ForbiddenException when no user', ()=>{
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
            'ADMIN'
        ]);
        (0, _vitest.expect)(()=>guard.canActivate(createContext())).toThrow(_common.ForbiddenException);
    });
});

//# sourceMappingURL=roles.guard.spec.js.map
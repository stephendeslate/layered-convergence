"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _common = require("@nestjs/common");
const _core = require("@nestjs/core");
const _rolesguard = require("./roles.guard");
function createMockContext(user) {
    const request = {
        user
    };
    return {
        switchToHttp: ()=>({
                getRequest: ()=>request
            }),
        getHandler: ()=>({}),
        getClass: ()=>({})
    };
}
(0, _vitest.describe)('RolesGuard', ()=>{
    (0, _vitest.it)('should allow when no roles required', ()=>{
        const reflector = new _core.Reflector();
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
        const guard = new _rolesguard.RolesGuard(reflector);
        const ctx = createMockContext({
            role: 'TECHNICIAN'
        });
        (0, _vitest.expect)(guard.canActivate(ctx)).toBe(true);
    });
    (0, _vitest.it)('should allow when user has required role', ()=>{
        const reflector = new _core.Reflector();
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
            'ADMIN'
        ]);
        const guard = new _rolesguard.RolesGuard(reflector);
        const ctx = createMockContext({
            role: 'ADMIN'
        });
        (0, _vitest.expect)(guard.canActivate(ctx)).toBe(true);
    });
    (0, _vitest.it)('should throw ForbiddenException when user lacks role', ()=>{
        const reflector = new _core.Reflector();
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
            'ADMIN'
        ]);
        const guard = new _rolesguard.RolesGuard(reflector);
        const ctx = createMockContext({
            role: 'TECHNICIAN'
        });
        (0, _vitest.expect)(()=>guard.canActivate(ctx)).toThrow(_common.ForbiddenException);
    });
    (0, _vitest.it)('should throw ForbiddenException when no user', ()=>{
        const reflector = new _core.Reflector();
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
            'ADMIN'
        ]);
        const guard = new _rolesguard.RolesGuard(reflector);
        const ctx = createMockContext();
        (0, _vitest.expect)(()=>guard.canActivate(ctx)).toThrow(_common.ForbiddenException);
    });
    (0, _vitest.it)('should allow when user has one of multiple roles', ()=>{
        const reflector = new _core.Reflector();
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
            'ADMIN',
            'DISPATCHER'
        ]);
        const guard = new _rolesguard.RolesGuard(reflector);
        const ctx = createMockContext({
            role: 'DISPATCHER'
        });
        (0, _vitest.expect)(guard.canActivate(ctx)).toBe(true);
    });
    (0, _vitest.it)('should allow with empty roles array', ()=>{
        const reflector = new _core.Reflector();
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
        const guard = new _rolesguard.RolesGuard(reflector);
        const ctx = createMockContext({
            role: 'TECHNICIAN'
        });
        (0, _vitest.expect)(guard.canActivate(ctx)).toBe(true);
    });
});

//# sourceMappingURL=roles.guard.spec.js.map
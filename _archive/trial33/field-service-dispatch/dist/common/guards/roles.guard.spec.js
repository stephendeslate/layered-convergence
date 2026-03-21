"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _rolesguard = require("./roles.guard");
const _core = require("@nestjs/core");
const _common = require("@nestjs/common");
(0, _vitest.describe)('RolesGuard', ()=>{
    let guard;
    let reflector;
    function createContext(user, requiredRoles) {
        const request = {
            user
        };
        reflector.getAllAndOverride = ()=>requiredRoles;
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
        guard = new _rolesguard.RolesGuard(reflector);
    });
    (0, _vitest.it)('should allow access when no roles are required', ()=>{
        const context = createContext(undefined, undefined);
        (0, _vitest.expect)(guard.canActivate(context)).toBe(true);
    });
    (0, _vitest.it)('should allow access when roles array is empty', ()=>{
        const context = createContext(undefined, []);
        (0, _vitest.expect)(guard.canActivate(context)).toBe(true);
    });
    (0, _vitest.it)('should allow access when user has required role', ()=>{
        const context = createContext({
            role: 'ADMIN'
        }, [
            'ADMIN',
            'DISPATCHER'
        ]);
        (0, _vitest.expect)(guard.canActivate(context)).toBe(true);
    });
    (0, _vitest.it)('should throw ForbiddenException when user lacks required role', ()=>{
        const context = createContext({
            role: 'CUSTOMER'
        }, [
            'ADMIN'
        ]);
        (0, _vitest.expect)(()=>guard.canActivate(context)).toThrow(_common.ForbiddenException);
    });
    (0, _vitest.it)('should throw ForbiddenException when no user present', ()=>{
        const context = createContext(undefined, [
            'ADMIN'
        ]);
        (0, _vitest.expect)(()=>guard.canActivate(context)).toThrow(_common.ForbiddenException);
    });
    (0, _vitest.it)('should throw with descriptive message', ()=>{
        const context = createContext({
            role: 'CUSTOMER'
        }, [
            'ADMIN'
        ]);
        (0, _vitest.expect)(()=>guard.canActivate(context)).toThrow('Insufficient permissions');
    });
});

//# sourceMappingURL=roles.guard.spec.js.map
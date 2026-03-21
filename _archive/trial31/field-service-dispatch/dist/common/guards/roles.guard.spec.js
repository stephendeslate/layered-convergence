"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _core = require("@nestjs/core");
const _rolesguard = require("./roles.guard");
(0, _vitest.describe)('RolesGuard', ()=>{
    let guard;
    let reflector;
    (0, _vitest.beforeEach)(async ()=>{
        const module = await _testing.Test.createTestingModule({
            providers: [
                _rolesguard.RolesGuard,
                _core.Reflector
            ]
        }).compile();
        guard = module.get(_rolesguard.RolesGuard);
        reflector = module.get(_core.Reflector);
    });
    const createContext = (user)=>({
            switchToHttp: ()=>({
                    getRequest: ()=>({
                            user
                        })
                }),
            getHandler: ()=>({}),
            getClass: ()=>({})
        });
    (0, _vitest.it)('should allow when no roles required', ()=>{
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
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
    (0, _vitest.it)('should deny when user lacks required role', ()=>{
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
            'ADMIN'
        ]);
        (0, _vitest.expect)(()=>guard.canActivate(createContext({
                role: 'DISPATCHER'
            }))).toThrow('Insufficient permissions');
    });
    (0, _vitest.it)('should allow when user has one of multiple roles', ()=>{
        _vitest.vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
            'ADMIN',
            'DISPATCHER'
        ]);
        (0, _vitest.expect)(guard.canActivate(createContext({
            role: 'DISPATCHER'
        }))).toBe(true);
    });
});

//# sourceMappingURL=roles.guard.spec.js.map
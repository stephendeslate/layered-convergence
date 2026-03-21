"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _common = require("@nestjs/common");
const _rolesguard = require("./roles.guard");
describe('RolesGuard', ()=>{
    let guard;
    let reflector;
    beforeEach(()=>{
        reflector = {
            getAllAndOverride: vi.fn()
        };
        guard = new _rolesguard.RolesGuard(reflector);
    });
    function createContext(user) {
        return {
            getHandler: vi.fn(),
            getClass: vi.fn(),
            switchToHttp: ()=>({
                    getRequest: ()=>({
                            user
                        })
                })
        };
    }
    it('should be defined', ()=>{
        expect(guard).toBeDefined();
    });
    it('should allow access when no roles required', ()=>{
        reflector.getAllAndOverride.mockReturnValue(undefined);
        expect(guard.canActivate(createContext({
            role: 'USER'
        }))).toBe(true);
    });
    it('should allow access when roles array is empty', ()=>{
        reflector.getAllAndOverride.mockReturnValue([]);
        expect(guard.canActivate(createContext({
            role: 'USER'
        }))).toBe(true);
    });
    it('should allow access when user has required role', ()=>{
        reflector.getAllAndOverride.mockReturnValue([
            'ADMIN'
        ]);
        expect(guard.canActivate(createContext({
            role: 'ADMIN'
        }))).toBe(true);
    });
    it('should deny access when user lacks required role', ()=>{
        reflector.getAllAndOverride.mockReturnValue([
            'ADMIN'
        ]);
        expect(()=>guard.canActivate(createContext({
                role: 'USER'
            }))).toThrow(_common.ForbiddenException);
    });
    it('should throw when no user in request', ()=>{
        reflector.getAllAndOverride.mockReturnValue([
            'ADMIN'
        ]);
        expect(()=>guard.canActivate(createContext(undefined))).toThrow(_common.ForbiddenException);
    });
    it('should allow if user has one of multiple required roles', ()=>{
        reflector.getAllAndOverride.mockReturnValue([
            'ADMIN',
            'SUPER'
        ]);
        expect(guard.canActivate(createContext({
            role: 'SUPER'
        }))).toBe(true);
    });
});

//# sourceMappingURL=roles.guard.spec.js.map
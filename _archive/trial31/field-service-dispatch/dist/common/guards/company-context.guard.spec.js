"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _common = require("@nestjs/common");
const _companycontextguard = require("./company-context.guard");
(0, _vitest.describe)('CompanyContextGuard', ()=>{
    const guard = new _companycontextguard.CompanyContextGuard();
    const createContext = (headers = {}, user)=>{
        const request = {
            headers,
            user,
            companyId: undefined
        };
        return {
            request,
            switchToHttp: ()=>({
                    getRequest: ()=>request
                })
        };
    };
    (0, _vitest.it)('should set companyId from x-company-id header', ()=>{
        const ctx = createContext({
            'x-company-id': 'comp-1'
        });
        (0, _vitest.expect)(guard.canActivate(ctx)).toBe(true);
        (0, _vitest.expect)(ctx.request.companyId).toBe('comp-1');
    });
    (0, _vitest.it)('should set companyId from user.companyId', ()=>{
        const ctx = createContext({}, {
            companyId: 'comp-2'
        });
        (0, _vitest.expect)(guard.canActivate(ctx)).toBe(true);
        (0, _vitest.expect)(ctx.request.companyId).toBe('comp-2');
    });
    (0, _vitest.it)('should prefer x-company-id header over user.companyId', ()=>{
        const ctx = createContext({
            'x-company-id': 'comp-1'
        }, {
            companyId: 'comp-2'
        });
        (0, _vitest.expect)(guard.canActivate(ctx)).toBe(true);
        (0, _vitest.expect)(ctx.request.companyId).toBe('comp-1');
    });
    (0, _vitest.it)('should throw BadRequestException when no companyId', ()=>{
        const ctx = createContext({});
        (0, _vitest.expect)(()=>guard.canActivate(ctx)).toThrow(_common.BadRequestException);
    });
});

//# sourceMappingURL=company-context.guard.spec.js.map
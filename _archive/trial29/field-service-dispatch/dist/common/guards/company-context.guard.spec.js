"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _common = require("@nestjs/common");
const _companycontextguard = require("./company-context.guard");
(0, _vitest.describe)('CompanyContextGuard', ()=>{
    let guard;
    (0, _vitest.beforeEach)(()=>{
        guard = new _companycontextguard.CompanyContextGuard();
    });
    const createContext = (headers = {}, user)=>{
        const request = {
            headers,
            user,
            companyId: undefined
        };
        return {
            switchToHttp: ()=>({
                    getRequest: ()=>request
                }),
            _request: request
        };
    };
    (0, _vitest.it)('should set companyId from x-company-id header', ()=>{
        const ctx = createContext({
            'x-company-id': 'comp1'
        });
        (0, _vitest.expect)(guard.canActivate(ctx)).toBe(true);
        (0, _vitest.expect)(ctx._request.companyId).toBe('comp1');
    });
    (0, _vitest.it)('should set companyId from user.companyId', ()=>{
        const ctx = createContext({}, {
            companyId: 'comp2'
        });
        (0, _vitest.expect)(guard.canActivate(ctx)).toBe(true);
        (0, _vitest.expect)(ctx._request.companyId).toBe('comp2');
    });
    (0, _vitest.it)('should prefer header over user.companyId', ()=>{
        const ctx = createContext({
            'x-company-id': 'comp1'
        }, {
            companyId: 'comp2'
        });
        (0, _vitest.expect)(guard.canActivate(ctx)).toBe(true);
        (0, _vitest.expect)(ctx._request.companyId).toBe('comp1');
    });
    (0, _vitest.it)('should throw BadRequestException when no companyId available', ()=>{
        const ctx = createContext({});
        (0, _vitest.expect)(()=>guard.canActivate(ctx)).toThrow(_common.BadRequestException);
    });
});

//# sourceMappingURL=company-context.guard.spec.js.map
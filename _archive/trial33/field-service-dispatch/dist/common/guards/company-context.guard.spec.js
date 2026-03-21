"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _companycontextguard = require("./company-context.guard");
const _common = require("@nestjs/common");
(0, _vitest.describe)('CompanyContextGuard', ()=>{
    let guard;
    function createContext(headers = {}, user) {
        const request = {
            headers,
            user,
            companyId: undefined
        };
        return {
            switchToHttp: ()=>({
                    getRequest: ()=>request
                })
        };
    }
    (0, _vitest.beforeEach)(()=>{
        guard = new _companycontextguard.CompanyContextGuard();
    });
    (0, _vitest.it)('should allow access when x-company-id header is present', ()=>{
        const context = createContext({
            'x-company-id': 'company-1'
        });
        (0, _vitest.expect)(guard.canActivate(context)).toBe(true);
    });
    (0, _vitest.it)('should set companyId on request from header', ()=>{
        const request = {
            headers: {
                'x-company-id': 'company-1'
            },
            user: undefined,
            companyId: undefined
        };
        const context = {
            switchToHttp: ()=>({
                    getRequest: ()=>request
                })
        };
        guard.canActivate(context);
        (0, _vitest.expect)(request.companyId).toBe('company-1');
    });
    (0, _vitest.it)('should fall back to user.companyId when header is missing', ()=>{
        const request = {
            headers: {},
            user: {
                companyId: 'company-2'
            },
            companyId: undefined
        };
        const context = {
            switchToHttp: ()=>({
                    getRequest: ()=>request
                })
        };
        (0, _vitest.expect)(guard.canActivate(context)).toBe(true);
        (0, _vitest.expect)(request.companyId).toBe('company-2');
    });
    (0, _vitest.it)('should throw BadRequestException when no company context', ()=>{
        const context = createContext({});
        (0, _vitest.expect)(()=>guard.canActivate(context)).toThrow(_common.BadRequestException);
    });
    (0, _vitest.it)('should throw with descriptive message', ()=>{
        const context = createContext({});
        (0, _vitest.expect)(()=>guard.canActivate(context)).toThrow('x-company-id header is required for tenant isolation');
    });
});

//# sourceMappingURL=company-context.guard.spec.js.map
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _common = require("@nestjs/common");
const _companycontextguard = require("./company-context.guard");
function createMockContext(headers, user) {
    const request = {
        headers,
        user
    };
    return {
        switchToHttp: ()=>({
                getRequest: ()=>request
            })
    };
}
(0, _vitest.describe)('CompanyContextGuard', ()=>{
    const guard = new _companycontextguard.CompanyContextGuard();
    (0, _vitest.it)('should allow request with x-company-id header', ()=>{
        const ctx = createMockContext({
            'x-company-id': 'comp-1'
        });
        (0, _vitest.expect)(guard.canActivate(ctx)).toBe(true);
    });
    (0, _vitest.it)('should set companyId on request', ()=>{
        const request = {
            headers: {
                'x-company-id': 'comp-1'
            }
        };
        const ctx = {
            switchToHttp: ()=>({
                    getRequest: ()=>request
                })
        };
        guard.canActivate(ctx);
        (0, _vitest.expect)(request.companyId).toBe('comp-1');
    });
    (0, _vitest.it)('should allow request with user.companyId', ()=>{
        const ctx = createMockContext({}, {
            companyId: 'comp-2'
        });
        (0, _vitest.expect)(guard.canActivate(ctx)).toBe(true);
    });
    (0, _vitest.it)('should throw BadRequestException when no company context', ()=>{
        const ctx = createMockContext({});
        (0, _vitest.expect)(()=>guard.canActivate(ctx)).toThrow(_common.BadRequestException);
    });
    (0, _vitest.it)('should prefer x-company-id header over user.companyId', ()=>{
        const request = {
            headers: {
                'x-company-id': 'header-comp'
            },
            user: {
                companyId: 'user-comp'
            }
        };
        const ctx = {
            switchToHttp: ()=>({
                    getRequest: ()=>request
                })
        };
        guard.canActivate(ctx);
        (0, _vitest.expect)(request.companyId).toBe('header-comp');
    });
});

//# sourceMappingURL=company-context.guard.spec.js.map
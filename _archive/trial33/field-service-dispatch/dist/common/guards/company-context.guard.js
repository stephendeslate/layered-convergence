"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CompanyContextGuard", {
    enumerable: true,
    get: function() {
        return CompanyContextGuard;
    }
});
const _common = require("@nestjs/common");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let CompanyContextGuard = class CompanyContextGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const companyId = request.headers['x-company-id'] || request.user?.companyId;
        if (!companyId) {
            throw new _common.BadRequestException('x-company-id header is required for tenant isolation');
        }
        request.companyId = companyId;
        return true;
    }
};
CompanyContextGuard = _ts_decorate([
    (0, _common.Injectable)()
], CompanyContextGuard);

//# sourceMappingURL=company-context.guard.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyContextMiddleware = void 0;
const common_1 = require("@nestjs/common");
let CompanyContextMiddleware = class CompanyContextMiddleware {
    use(req, _res, next) {
        const companyId = req.headers['x-company-id'];
        if (!companyId || typeof companyId !== 'string') {
            throw new common_1.BadRequestException('x-company-id header is required');
        }
        req.companyId = companyId;
        next();
    }
};
exports.CompanyContextMiddleware = CompanyContextMiddleware;
exports.CompanyContextMiddleware = CompanyContextMiddleware = __decorate([
    (0, common_1.Injectable)()
], CompanyContextMiddleware);
//# sourceMappingURL=company-context.middleware.js.map
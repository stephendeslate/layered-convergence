"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantContextMiddleware = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../../prisma/prisma.service.js");
const client_js_1 = require("../../../generated/prisma/client.js");
let TenantContextMiddleware = class TenantContextMiddleware {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async use(req, _res, next) {
        const tenantId = req.headers['x-tenant-id'];
        if (!tenantId) {
            throw new common_1.BadRequestException('x-tenant-id header is required');
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(tenantId)) {
            throw new common_1.BadRequestException('x-tenant-id must be a valid UUID');
        }
        const tenant = await this.prisma.tenant.findFirst({
            where: { id: tenantId },
        });
        if (!tenant) {
            throw new common_1.BadRequestException('Tenant not found');
        }
        await this.prisma.$executeRaw(client_js_1.Prisma.sql `SELECT set_config('app.tenant_id', ${tenantId}, true)`);
        req.tenantId = tenantId;
        next();
    }
};
exports.TenantContextMiddleware = TenantContextMiddleware;
exports.TenantContextMiddleware = TenantContextMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], TenantContextMiddleware);
//# sourceMappingURL=tenant-context.middleware.js.map
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ApiKeyGuard", {
    enumerable: true,
    get: function() {
        return ApiKeyGuard;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../prisma/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ApiKeyGuard = class ApiKeyGuard {
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'] || request.query?.apiKey;
        if (!apiKey) {
            throw new _common.UnauthorizedException('API key is required');
        }
        const tenant = await this.prisma.tenant.findUnique({
            where: {
                apiKey
            }
        });
        if (!tenant) {
            throw new _common.UnauthorizedException('Invalid API key');
        }
        request.tenant = tenant;
        request.tenantId = tenant.id;
        return true;
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
ApiKeyGuard = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], ApiKeyGuard);

//# sourceMappingURL=api-key.guard.js.map
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TenantsService", {
    enumerable: true,
    get: function() {
        return TenantsService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../prisma/prisma.service");
const _crypto = require("crypto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let TenantsService = class TenantsService {
    async create(dto) {
        return this.prisma.tenant.create({
            data: {
                name: dto.name,
                apiKey: (0, _crypto.randomUUID)(),
                primaryColor: dto.primaryColor,
                fontFamily: dto.fontFamily,
                logoUrl: dto.logoUrl
            }
        });
    }
    async findAll() {
        return this.prisma.tenant.findMany();
    }
    async findById(id) {
        const tenant = await this.prisma.tenant.findUnique({
            where: {
                id
            }
        });
        if (!tenant) {
            throw new _common.NotFoundException(`Tenant ${id} not found`);
        }
        return tenant;
    }
    async findByApiKey(apiKey) {
        return this.prisma.tenant.findUnique({
            where: {
                apiKey
            }
        });
    }
    async update(id, dto) {
        return this.prisma.tenant.update({
            where: {
                id
            },
            data: dto
        });
    }
    async remove(id) {
        return this.prisma.tenant.delete({
            where: {
                id
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
TenantsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], TenantsService);

//# sourceMappingURL=tenants.service.js.map
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CompaniesService", {
    enumerable: true,
    get: function() {
        return CompaniesService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../prisma/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CompaniesService = class CompaniesService {
    async create(dto) {
        return this.prisma.company.create({
            data: {
                name: dto.name,
                slug: dto.slug,
                serviceArea: dto.serviceArea ?? undefined,
                branding: dto.branding ?? undefined
            }
        });
    }
    async findAll() {
        return this.prisma.company.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async findOne(id) {
        const company = await this.prisma.company.findUnique({
            where: {
                id
            }
        });
        if (!company) {
            throw new _common.NotFoundException(`Company ${id} not found`);
        }
        return company;
    }
    async findBySlug(slug) {
        const company = await this.prisma.company.findUnique({
            where: {
                slug
            }
        });
        if (!company) {
            throw new _common.NotFoundException(`Company with slug ${slug} not found`);
        }
        return company;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.company.update({
            where: {
                id
            },
            data: {
                name: dto.name,
                serviceArea: dto.serviceArea ?? undefined,
                branding: dto.branding ?? undefined
            }
        });
    }
    async delete(id) {
        await this.findOne(id);
        return this.prisma.company.delete({
            where: {
                id
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
CompaniesService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], CompaniesService);

//# sourceMappingURL=companies.service.js.map
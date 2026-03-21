"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RoutesService", {
    enumerable: true,
    get: function() {
        return RoutesService;
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
let RoutesService = class RoutesService {
    async create(companyId, dto) {
        return this.prisma.route.create({
            data: {
                companyId,
                technicianId: dto.technicianId,
                date: new Date(dto.date),
                waypoints: dto.waypoints,
                optimizedOrder: dto.optimizedOrder || [],
                estimatedDuration: dto.estimatedDuration
            },
            include: {
                technician: true
            }
        });
    }
    async findAll(companyId) {
        return this.prisma.route.findMany({
            where: {
                companyId
            },
            include: {
                technician: true
            },
            orderBy: {
                date: 'desc'
            }
        });
    }
    async findOne(companyId, id) {
        const route = await this.prisma.route.findFirst({
            where: {
                id,
                companyId
            },
            include: {
                technician: true
            }
        });
        if (!route) {
            throw new _common.NotFoundException(`Route ${id} not found`);
        }
        return route;
    }
    async findByTechnician(companyId, technicianId) {
        return this.prisma.route.findMany({
            where: {
                companyId,
                technicianId
            },
            include: {
                technician: true
            },
            orderBy: {
                date: 'desc'
            }
        });
    }
    async delete(companyId, id) {
        await this.findOne(companyId, id);
        return this.prisma.route.delete({
            where: {
                id
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
RoutesService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], RoutesService);

//# sourceMappingURL=routes.service.js.map
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TechniciansService", {
    enumerable: true,
    get: function() {
        return TechniciansService;
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
let TechniciansService = class TechniciansService {
    async create(companyId, dto) {
        return this.prisma.technician.create({
            data: {
                companyId,
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                skills: dto.skills || [],
                currentLat: dto.currentLat,
                currentLng: dto.currentLng
            }
        });
    }
    async findAll(companyId, status) {
        return this.prisma.technician.findMany({
            where: {
                companyId,
                ...status && {
                    status
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
    }
    async findOne(companyId, id) {
        const technician = await this.prisma.technician.findFirst({
            where: {
                id,
                companyId
            },
            include: {
                workOrders: {
                    where: {
                        status: {
                            not: 'PAID'
                        }
                    }
                }
            }
        });
        if (!technician) {
            throw new _common.NotFoundException(`Technician ${id} not found`);
        }
        return technician;
    }
    async update(companyId, id, dto) {
        await this.findOne(companyId, id);
        return this.prisma.technician.update({
            where: {
                id
            },
            data: {
                name: dto.name,
                phone: dto.phone,
                skills: dto.skills,
                currentLat: dto.currentLat,
                currentLng: dto.currentLng,
                status: dto.status
            }
        });
    }
    async updateLocation(companyId, id, lat, lng) {
        await this.findOne(companyId, id);
        return this.prisma.technician.update({
            where: {
                id
            },
            data: {
                currentLat: lat,
                currentLng: lng
            }
        });
    }
    async delete(companyId, id) {
        await this.findOne(companyId, id);
        return this.prisma.technician.delete({
            where: {
                id
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
TechniciansService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], TechniciansService);

//# sourceMappingURL=technicians.service.js.map
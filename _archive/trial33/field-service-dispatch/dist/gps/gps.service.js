"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GpsService", {
    enumerable: true,
    get: function() {
        return GpsService;
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
let GpsService = class GpsService {
    async updatePosition(position) {
        const updated = await this.prisma.technician.update({
            where: {
                id: position.technicianId
            },
            data: {
                currentLat: position.lat,
                currentLng: position.lng
            }
        });
        await this.prisma.gpsEvent.create({
            data: {
                technicianId: position.technicianId,
                lat: position.lat,
                lng: position.lng
            }
        });
        return updated;
    }
    async getPosition(technicianId) {
        const technician = await this.prisma.technician.findUnique({
            where: {
                id: technicianId
            },
            select: {
                id: true,
                name: true,
                currentLat: true,
                currentLng: true,
                companyId: true
            }
        });
        return technician;
    }
    async getCompanyPositions(companyId) {
        return this.prisma.technician.findMany({
            where: {
                companyId,
                status: {
                    not: 'OFF_DUTY'
                }
            },
            select: {
                id: true,
                name: true,
                currentLat: true,
                currentLng: true,
                status: true
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
GpsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], GpsService);

//# sourceMappingURL=gps.service.js.map
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
    async updateLocation(companyId, technicianId, lat, lng) {
        return this.prisma.technician.updateMany({
            where: {
                id: technicianId,
                companyId
            },
            data: {
                currentLat: lat,
                currentLng: lng
            }
        });
    }
    async getLocations(companyId) {
        return this.prisma.technician.findMany({
            where: {
                companyId,
                currentLat: {
                    not: null
                },
                currentLng: {
                    not: null
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
    async getTechnicianLocation(companyId, technicianId) {
        return this.prisma.technician.findFirst({
            where: {
                id: technicianId,
                companyId
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
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = this.toRad(lat2 - lat1);
        const dLng = this.toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    toRad(deg) {
        return deg * (Math.PI / 180);
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
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
exports.RouteService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
let RouteService = class RouteService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.route.create({
            data: {
                technicianId: dto.technicianId,
                date: new Date(dto.date),
                waypoints: dto.waypoints,
                estimatedDuration: dto.estimatedDuration,
            },
        });
    }
    async findByTechnician(technicianId) {
        return this.prisma.route.findMany({
            where: { technicianId },
            orderBy: { date: 'desc' },
        });
    }
    async findOne(id) {
        const route = await this.prisma.route.findUnique({ where: { id } });
        if (!route) {
            throw new common_1.NotFoundException(`Route ${id} not found`);
        }
        return route;
    }
    async optimize(id) {
        const route = await this.findOne(id);
        const waypoints = route.waypoints;
        const optimizedOrder = [...waypoints].reverse();
        return this.prisma.route.update({
            where: { id },
            data: { optimizedOrder },
        });
    }
};
exports.RouteService = RouteService;
exports.RouteService = RouteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], RouteService);
//# sourceMappingURL=route.service.js.map
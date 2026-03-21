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
exports.TechnicianService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
let TechnicianService = class TechnicianService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.technician.create({ data: dto });
    }
    async findAllByCompany(companyId) {
        return this.prisma.technician.findMany({ where: { companyId } });
    }
    async findOne(id, companyId) {
        const technician = await this.prisma.technician.findFirst({
            where: { id, companyId },
        });
        if (!technician) {
            throw new common_1.NotFoundException(`Technician ${id} not found`);
        }
        return technician;
    }
    async update(id, companyId, dto) {
        await this.findOne(id, companyId);
        return this.prisma.technician.update({ where: { id }, data: dto });
    }
    async updatePosition(id, companyId, lat, lng) {
        await this.findOne(id, companyId);
        return this.prisma.technician.update({
            where: { id },
            data: { currentLat: lat, currentLng: lng },
        });
    }
    async remove(id, companyId) {
        await this.findOne(id, companyId);
        return this.prisma.technician.delete({ where: { id } });
    }
};
exports.TechnicianService = TechnicianService;
exports.TechnicianService = TechnicianService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], TechnicianService);
//# sourceMappingURL=technician.service.js.map
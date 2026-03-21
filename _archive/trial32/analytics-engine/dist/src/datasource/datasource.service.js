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
exports.DataSourceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
let DataSourceService = class DataSourceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, dto) {
        return this.prisma.dataSource.create({
            data: { ...dto, tenantId },
        });
    }
    async findAll(tenantId) {
        return this.prisma.dataSource.findMany({
            where: { tenantId },
            include: { config: true },
        });
    }
    async findOne(tenantId, id) {
        const ds = await this.prisma.dataSource.findFirst({
            where: { id, tenantId },
            include: { config: true },
        });
        if (!ds) {
            throw new common_1.NotFoundException('DataSource not found');
        }
        return ds;
    }
    async update(tenantId, id, dto) {
        await this.findOne(tenantId, id);
        return this.prisma.dataSource.update({
            where: { id },
            data: dto,
        });
    }
    async remove(tenantId, id) {
        await this.findOne(tenantId, id);
        return this.prisma.dataSource.delete({ where: { id } });
    }
    async createConfig(tenantId, dataSourceId, dto) {
        await this.findOne(tenantId, dataSourceId);
        return this.prisma.dataSourceConfig.create({
            data: { ...dto, dataSourceId },
        });
    }
    async updateConfig(tenantId, dataSourceId, dto) {
        await this.findOne(tenantId, dataSourceId);
        const config = await this.prisma.dataSourceConfig.findFirst({
            where: { dataSourceId },
        });
        if (!config) {
            throw new common_1.NotFoundException('DataSourceConfig not found');
        }
        return this.prisma.dataSourceConfig.update({
            where: { id: config.id },
            data: dto,
        });
    }
};
exports.DataSourceService = DataSourceService;
exports.DataSourceService = DataSourceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], DataSourceService);
//# sourceMappingURL=datasource.service.js.map
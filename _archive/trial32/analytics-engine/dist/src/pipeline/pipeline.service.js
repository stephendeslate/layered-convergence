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
exports.PipelineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const VALID_TRANSITIONS = {
    RUNNING: ['COMPLETED', 'FAILED'],
};
let PipelineService = class PipelineService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async startSync(tenantId, dataSourceId) {
        const ds = await this.prisma.dataSource.findFirst({
            where: { id: dataSourceId, tenantId },
        });
        if (!ds) {
            throw new common_1.NotFoundException('DataSource not found');
        }
        return this.prisma.syncRun.create({
            data: {
                dataSourceId,
                status: 'RUNNING',
            },
        });
    }
    async updateSyncStatus(id, status, rowsIngested, errorLog) {
        const syncRun = await this.prisma.syncRun.findUnique({ where: { id } });
        if (!syncRun) {
            throw new common_1.NotFoundException('SyncRun not found');
        }
        const allowed = VALID_TRANSITIONS[syncRun.status];
        if (!allowed || !allowed.includes(status)) {
            throw new common_1.BadRequestException(`Invalid state transition from ${syncRun.status} to ${status}`);
        }
        const data = { status };
        if (status === 'COMPLETED' || status === 'FAILED') {
            data.completedAt = new Date();
        }
        if (rowsIngested !== undefined) {
            data.rowsIngested = rowsIngested;
        }
        if (errorLog !== undefined) {
            data.errorLog = errorLog;
        }
        return this.prisma.syncRun.update({
            where: { id },
            data,
        });
    }
    async getSyncRuns(dataSourceId) {
        return this.prisma.syncRun.findMany({
            where: { dataSourceId },
            orderBy: { startedAt: 'desc' },
        });
    }
    async getSyncRun(id) {
        const syncRun = await this.prisma.syncRun.findUnique({ where: { id } });
        if (!syncRun) {
            throw new common_1.NotFoundException('SyncRun not found');
        }
        return syncRun;
    }
    async createDeadLetterEvent(dataSourceId, payload, errorReason) {
        return this.prisma.deadLetterEvent.create({
            data: { dataSourceId, payload, errorReason },
        });
    }
    async getDeadLetterEvents(dataSourceId) {
        return this.prisma.deadLetterEvent.findMany({
            where: { dataSourceId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async retryDeadLetterEvent(id) {
        const event = await this.prisma.deadLetterEvent.findUnique({
            where: { id },
        });
        if (!event) {
            throw new common_1.NotFoundException('DeadLetterEvent not found');
        }
        return this.prisma.deadLetterEvent.update({
            where: { id },
            data: { retriedAt: new Date() },
        });
    }
};
exports.PipelineService = PipelineService;
exports.PipelineService = PipelineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], PipelineService);
//# sourceMappingURL=pipeline.service.js.map
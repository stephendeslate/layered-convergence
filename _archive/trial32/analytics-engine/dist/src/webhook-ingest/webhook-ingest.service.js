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
exports.WebhookIngestService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const datapoint_service_js_1 = require("../datapoint/datapoint.service.js");
const pipeline_service_js_1 = require("../pipeline/pipeline.service.js");
let WebhookIngestService = class WebhookIngestService {
    prisma;
    dataPointService;
    pipelineService;
    constructor(prisma, dataPointService, pipelineService) {
        this.prisma = prisma;
        this.dataPointService = dataPointService;
        this.pipelineService = pipelineService;
    }
    async ingest(apiKey, payload) {
        const tenant = await this.prisma.tenant.findFirst({
            where: { apiKey },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Invalid API key');
        }
        const dataSource = await this.prisma.dataSource.findFirst({
            where: { tenantId: tenant.id, type: 'WEBHOOK' },
        });
        if (!dataSource) {
            throw new common_1.BadRequestException('No webhook data source configured for this tenant');
        }
        const events = Array.isArray(payload.events)
            ? payload.events
            : [payload];
        const syncRun = await this.pipelineService.startSync(tenant.id, dataSource.id);
        try {
            const points = events.map((event) => ({
                timestamp: event.timestamp
                    ? new Date(event.timestamp)
                    : new Date(),
                dimensions: event.dimensions ?? {},
                metrics: event.metrics ?? {},
            }));
            await this.dataPointService.createMany(tenant.id, dataSource.id, points);
            await this.pipelineService.updateSyncStatus(syncRun.id, 'COMPLETED', points.length);
            return { ingested: points.length, syncRunId: syncRun.id };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await this.pipelineService.updateSyncStatus(syncRun.id, 'FAILED', 0, errorMessage);
            await this.pipelineService.createDeadLetterEvent(dataSource.id, payload, errorMessage);
            throw error;
        }
    }
};
exports.WebhookIngestService = WebhookIngestService;
exports.WebhookIngestService = WebhookIngestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService,
        datapoint_service_js_1.DataPointService,
        pipeline_service_js_1.PipelineService])
], WebhookIngestService);
//# sourceMappingURL=webhook-ingest.service.js.map
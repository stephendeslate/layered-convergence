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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineController = void 0;
const common_1 = require("@nestjs/common");
const pipeline_service_js_1 = require("./pipeline.service.js");
const update_sync_run_dto_js_1 = require("./dto/update-sync-run.dto.js");
let PipelineController = class PipelineController {
    pipelineService;
    constructor(pipelineService) {
        this.pipelineService = pipelineService;
    }
    startSync(req, dataSourceId) {
        return this.pipelineService.startSync(req.tenantId, dataSourceId);
    }
    updateSyncStatus(id, dto) {
        return this.pipelineService.updateSyncStatus(id, dto.status, dto.rowsIngested, dto.errorLog);
    }
    getSyncRun(id) {
        return this.pipelineService.getSyncRun(id);
    }
    getSyncRuns(dataSourceId) {
        return this.pipelineService.getSyncRuns(dataSourceId);
    }
    getDeadLetterEvents(dataSourceId) {
        return this.pipelineService.getDeadLetterEvents(dataSourceId);
    }
    retryDeadLetterEvent(id) {
        return this.pipelineService.retryDeadLetterEvent(id);
    }
};
exports.PipelineController = PipelineController;
__decorate([
    (0, common_1.Post)('datasources/:dataSourceId/sync'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('dataSourceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PipelineController.prototype, "startSync", null);
__decorate([
    (0, common_1.Patch)('sync-runs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_sync_run_dto_js_1.UpdateSyncRunDto]),
    __metadata("design:returntype", void 0)
], PipelineController.prototype, "updateSyncStatus", null);
__decorate([
    (0, common_1.Get)('sync-runs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PipelineController.prototype, "getSyncRun", null);
__decorate([
    (0, common_1.Get)('datasources/:dataSourceId/sync-runs'),
    __param(0, (0, common_1.Param)('dataSourceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PipelineController.prototype, "getSyncRuns", null);
__decorate([
    (0, common_1.Get)('datasources/:dataSourceId/dead-letter-events'),
    __param(0, (0, common_1.Param)('dataSourceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PipelineController.prototype, "getDeadLetterEvents", null);
__decorate([
    (0, common_1.Post)('dead-letter-events/:id/retry'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PipelineController.prototype, "retryDeadLetterEvent", null);
exports.PipelineController = PipelineController = __decorate([
    (0, common_1.Controller)('pipeline'),
    __metadata("design:paramtypes", [pipeline_service_js_1.PipelineService])
], PipelineController);
//# sourceMappingURL=pipeline.controller.js.map
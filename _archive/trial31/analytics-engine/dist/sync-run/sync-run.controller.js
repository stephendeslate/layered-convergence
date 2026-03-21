"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SyncRunController", {
    enumerable: true,
    get: function() {
        return SyncRunController;
    }
});
const _common = require("@nestjs/common");
const _syncrunservice = require("./sync-run.service");
const _createsyncrundto = require("./dto/create-sync-run.dto");
const _updatesyncrunstatusdto = require("./dto/update-sync-run-status.dto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let SyncRunController = class SyncRunController {
    create(dto) {
        return this.syncRunService.create(dto);
    }
    findAll(dataSourceId) {
        return this.syncRunService.findAll(dataSourceId);
    }
    findOne(id) {
        return this.syncRunService.findOne(id);
    }
    updateStatus(id, dto) {
        return this.syncRunService.updateStatus(id, dto);
    }
    getHistory(dataSourceId, limit) {
        return this.syncRunService.getHistory(dataSourceId, limit ? parseInt(limit, 10) : undefined);
    }
    remove(id) {
        return this.syncRunService.remove(id);
    }
    constructor(syncRunService){
        this.syncRunService = syncRunService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createsyncrundto.CreateSyncRunDto === "undefined" ? Object : _createsyncrundto.CreateSyncRunDto
    ]),
    _ts_metadata("design:returntype", void 0)
], SyncRunController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('dataSourceId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SyncRunController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SyncRunController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Put)(':id/status'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatesyncrunstatusdto.UpdateSyncRunStatusDto === "undefined" ? Object : _updatesyncrunstatusdto.UpdateSyncRunStatusDto
    ]),
    _ts_metadata("design:returntype", void 0)
], SyncRunController.prototype, "updateStatus", null);
_ts_decorate([
    (0, _common.Get)('history/:dataSourceId'),
    _ts_param(0, (0, _common.Param)('dataSourceId')),
    _ts_param(1, (0, _common.Query)('limit')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SyncRunController.prototype, "getHistory", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SyncRunController.prototype, "remove", null);
SyncRunController = _ts_decorate([
    (0, _common.Controller)('sync-runs'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _syncrunservice.SyncRunService === "undefined" ? Object : _syncrunservice.SyncRunService
    ])
], SyncRunController);

//# sourceMappingURL=sync-run.controller.js.map
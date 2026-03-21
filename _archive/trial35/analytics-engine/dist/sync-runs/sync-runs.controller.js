"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SyncRunsController", {
    enumerable: true,
    get: function() {
        return SyncRunsController;
    }
});
const _common = require("@nestjs/common");
const _syncrunsservice = require("./sync-runs.service");
const _createsyncrundto = require("./dto/create-sync-run.dto");
const _prismaexceptionfilter = require("../common/filters/prisma-exception.filter");
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
let SyncRunsController = class SyncRunsController {
    create(dto) {
        return this.syncRunsService.create(dto);
    }
    findByDataSource(dataSourceId) {
        return this.syncRunsService.findByDataSource(dataSourceId);
    }
    findById(id) {
        return this.syncRunsService.findById(id);
    }
    constructor(syncRunsService){
        this.syncRunsService = syncRunsService;
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
], SyncRunsController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('dataSourceId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SyncRunsController.prototype, "findByDataSource", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], SyncRunsController.prototype, "findById", null);
SyncRunsController = _ts_decorate([
    (0, _common.Controller)('sync-runs'),
    (0, _common.UseFilters)(_prismaexceptionfilter.PrismaExceptionFilter),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _syncrunsservice.SyncRunsService === "undefined" ? Object : _syncrunsservice.SyncRunsService
    ])
], SyncRunsController);

//# sourceMappingURL=sync-runs.controller.js.map
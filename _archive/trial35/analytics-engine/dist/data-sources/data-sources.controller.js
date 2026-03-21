"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DataSourcesController", {
    enumerable: true,
    get: function() {
        return DataSourcesController;
    }
});
const _common = require("@nestjs/common");
const _datasourcesservice = require("./data-sources.service");
const _createdatasourcedto = require("./dto/create-data-source.dto");
const _updatedatasourcedto = require("./dto/update-data-source.dto");
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
let DataSourcesController = class DataSourcesController {
    create(dto) {
        return this.dataSourcesService.create(dto);
    }
    findAll(tenantId) {
        return this.dataSourcesService.findAll(tenantId);
    }
    findById(id) {
        return this.dataSourcesService.findById(id);
    }
    update(id, dto) {
        return this.dataSourcesService.update(id, dto);
    }
    remove(id) {
        return this.dataSourcesService.remove(id);
    }
    constructor(dataSourcesService){
        this.dataSourcesService = dataSourcesService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createdatasourcedto.CreateDataSourceDto === "undefined" ? Object : _createdatasourcedto.CreateDataSourceDto
    ]),
    _ts_metadata("design:returntype", void 0)
], DataSourcesController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('tenantId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DataSourcesController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DataSourcesController.prototype, "findById", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatedatasourcedto.UpdateDataSourceDto === "undefined" ? Object : _updatedatasourcedto.UpdateDataSourceDto
    ]),
    _ts_metadata("design:returntype", void 0)
], DataSourcesController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DataSourcesController.prototype, "remove", null);
DataSourcesController = _ts_decorate([
    (0, _common.Controller)('data-sources'),
    (0, _common.UseFilters)(_prismaexceptionfilter.PrismaExceptionFilter),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _datasourcesservice.DataSourcesService === "undefined" ? Object : _datasourcesservice.DataSourcesService
    ])
], DataSourcesController);

//# sourceMappingURL=data-sources.controller.js.map
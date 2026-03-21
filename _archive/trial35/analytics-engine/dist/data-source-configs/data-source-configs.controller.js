"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DataSourceConfigsController", {
    enumerable: true,
    get: function() {
        return DataSourceConfigsController;
    }
});
const _common = require("@nestjs/common");
const _datasourceconfigsservice = require("./data-source-configs.service");
const _createdatasourceconfigdto = require("./dto/create-data-source-config.dto");
const _updatedatasourceconfigdto = require("./dto/update-data-source-config.dto");
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
let DataSourceConfigsController = class DataSourceConfigsController {
    create(dto) {
        return this.service.create(dto);
    }
    findByDataSource(dataSourceId) {
        return this.service.findByDataSource(dataSourceId);
    }
    update(dataSourceId, dto) {
        return this.service.update(dataSourceId, dto);
    }
    remove(dataSourceId) {
        return this.service.remove(dataSourceId);
    }
    constructor(service){
        this.service = service;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createdatasourceconfigdto.CreateDataSourceConfigDto === "undefined" ? Object : _createdatasourceconfigdto.CreateDataSourceConfigDto
    ]),
    _ts_metadata("design:returntype", void 0)
], DataSourceConfigsController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(':dataSourceId'),
    _ts_param(0, (0, _common.Param)('dataSourceId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DataSourceConfigsController.prototype, "findByDataSource", null);
_ts_decorate([
    (0, _common.Patch)(':dataSourceId'),
    _ts_param(0, (0, _common.Param)('dataSourceId')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatedatasourceconfigdto.UpdateDataSourceConfigDto === "undefined" ? Object : _updatedatasourceconfigdto.UpdateDataSourceConfigDto
    ]),
    _ts_metadata("design:returntype", void 0)
], DataSourceConfigsController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':dataSourceId'),
    _ts_param(0, (0, _common.Param)('dataSourceId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DataSourceConfigsController.prototype, "remove", null);
DataSourceConfigsController = _ts_decorate([
    (0, _common.Controller)('data-source-configs'),
    (0, _common.UseFilters)(_prismaexceptionfilter.PrismaExceptionFilter),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _datasourceconfigsservice.DataSourceConfigsService === "undefined" ? Object : _datasourceconfigsservice.DataSourceConfigsService
    ])
], DataSourceConfigsController);

//# sourceMappingURL=data-source-configs.controller.js.map
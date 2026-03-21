"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DataSourceConfigController", {
    enumerable: true,
    get: function() {
        return DataSourceConfigController;
    }
});
const _common = require("@nestjs/common");
const _datasourceconfigservice = require("./data-source-config.service");
const _createdatasourceconfigdto = require("./dto/create-data-source-config.dto");
const _updatedatasourceconfigdto = require("./dto/update-data-source-config.dto");
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
let DataSourceConfigController = class DataSourceConfigController {
    create(dto) {
        return this.service.create(dto);
    }
    findByDataSource(dataSourceId) {
        return this.service.findByDataSource(dataSourceId);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    remove(id) {
        return this.service.remove(id);
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
], DataSourceConfigController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('dataSourceId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DataSourceConfigController.prototype, "findByDataSource", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DataSourceConfigController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatedatasourceconfigdto.UpdateDataSourceConfigDto === "undefined" ? Object : _updatedatasourceconfigdto.UpdateDataSourceConfigDto
    ]),
    _ts_metadata("design:returntype", void 0)
], DataSourceConfigController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DataSourceConfigController.prototype, "remove", null);
DataSourceConfigController = _ts_decorate([
    (0, _common.Controller)('data-source-configs'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _datasourceconfigservice.DataSourceConfigService === "undefined" ? Object : _datasourceconfigservice.DataSourceConfigService
    ])
], DataSourceConfigController);

//# sourceMappingURL=data-source-config.controller.js.map
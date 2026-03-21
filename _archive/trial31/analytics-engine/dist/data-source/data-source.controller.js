"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DataSourceController", {
    enumerable: true,
    get: function() {
        return DataSourceController;
    }
});
const _common = require("@nestjs/common");
const _datasourceservice = require("./data-source.service");
const _createdatasourcedto = require("./dto/create-data-source.dto");
const _updatedatasourcedto = require("./dto/update-data-source.dto");
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
let DataSourceController = class DataSourceController {
    create(dto) {
        return this.dataSourceService.create(dto);
    }
    findAll(tenantId) {
        return this.dataSourceService.findAll(tenantId);
    }
    findOne(id) {
        return this.dataSourceService.findOne(id);
    }
    update(id, dto) {
        return this.dataSourceService.update(id, dto);
    }
    remove(id) {
        return this.dataSourceService.remove(id);
    }
    constructor(dataSourceService){
        this.dataSourceService = dataSourceService;
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
], DataSourceController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('tenantId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DataSourceController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DataSourceController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatedatasourcedto.UpdateDataSourceDto === "undefined" ? Object : _updatedatasourcedto.UpdateDataSourceDto
    ]),
    _ts_metadata("design:returntype", void 0)
], DataSourceController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DataSourceController.prototype, "remove", null);
DataSourceController = _ts_decorate([
    (0, _common.Controller)('data-sources'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _datasourceservice.DataSourceService === "undefined" ? Object : _datasourceservice.DataSourceService
    ])
], DataSourceController);

//# sourceMappingURL=data-source.controller.js.map
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
exports.DataSourceController = void 0;
const common_1 = require("@nestjs/common");
const datasource_service_js_1 = require("./datasource.service.js");
const create_datasource_dto_js_1 = require("./dto/create-datasource.dto.js");
const update_datasource_dto_js_1 = require("./dto/update-datasource.dto.js");
let DataSourceController = class DataSourceController {
    dataSourceService;
    constructor(dataSourceService) {
        this.dataSourceService = dataSourceService;
    }
    create(req, dto) {
        return this.dataSourceService.create(req.tenantId, dto);
    }
    findAll(req) {
        return this.dataSourceService.findAll(req.tenantId);
    }
    findOne(req, id) {
        return this.dataSourceService.findOne(req.tenantId, id);
    }
    update(req, id, dto) {
        return this.dataSourceService.update(req.tenantId, id, dto);
    }
    remove(req, id) {
        return this.dataSourceService.remove(req.tenantId, id);
    }
    createConfig(req, id, dto) {
        return this.dataSourceService.createConfig(req.tenantId, id, dto);
    }
    updateConfig(req, id, dto) {
        return this.dataSourceService.updateConfig(req.tenantId, id, dto);
    }
};
exports.DataSourceController = DataSourceController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_datasource_dto_js_1.CreateDataSourceDto]),
    __metadata("design:returntype", void 0)
], DataSourceController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DataSourceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DataSourceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_datasource_dto_js_1.UpdateDataSourceDto]),
    __metadata("design:returntype", void 0)
], DataSourceController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DataSourceController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/config'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_datasource_dto_js_1.CreateDataSourceConfigDto]),
    __metadata("design:returntype", void 0)
], DataSourceController.prototype, "createConfig", null);
__decorate([
    (0, common_1.Put)(':id/config'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_datasource_dto_js_1.UpdateDataSourceConfigDto]),
    __metadata("design:returntype", void 0)
], DataSourceController.prototype, "updateConfig", null);
exports.DataSourceController = DataSourceController = __decorate([
    (0, common_1.Controller)('datasources'),
    __metadata("design:paramtypes", [datasource_service_js_1.DataSourceService])
], DataSourceController);
//# sourceMappingURL=datasource.controller.js.map
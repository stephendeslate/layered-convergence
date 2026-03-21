"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TechniciansController", {
    enumerable: true,
    get: function() {
        return TechniciansController;
    }
});
const _common = require("@nestjs/common");
const _companycontextguard = require("../common/guards/company-context.guard");
const _companyiddecorator = require("../common/decorators/company-id.decorator");
const _techniciansservice = require("./technicians.service");
const _createtechniciandto = require("./dto/create-technician.dto");
const _updatetechniciandto = require("./dto/update-technician.dto");
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
let TechniciansController = class TechniciansController {
    create(companyId, dto) {
        return this.techniciansService.create(companyId, dto);
    }
    findAll(companyId) {
        return this.techniciansService.findAll(companyId);
    }
    findAvailable(companyId) {
        return this.techniciansService.findAvailable(companyId);
    }
    findOne(companyId, id) {
        return this.techniciansService.findOne(companyId, id);
    }
    update(companyId, id, dto) {
        return this.techniciansService.update(companyId, id, dto);
    }
    delete(companyId, id) {
        return this.techniciansService.delete(companyId, id);
    }
    constructor(techniciansService){
        this.techniciansService = techniciansService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _createtechniciandto.CreateTechnicianDto === "undefined" ? Object : _createtechniciandto.CreateTechnicianDto
    ]),
    _ts_metadata("design:returntype", void 0)
], TechniciansController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], TechniciansController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)('available'),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], TechniciansController.prototype, "findAvailable", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], TechniciansController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_param(2, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        typeof _updatetechniciandto.UpdateTechnicianDto === "undefined" ? Object : _updatetechniciandto.UpdateTechnicianDto
    ]),
    _ts_metadata("design:returntype", void 0)
], TechniciansController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], TechniciansController.prototype, "delete", null);
TechniciansController = _ts_decorate([
    (0, _common.Controller)('technicians'),
    (0, _common.UseGuards)(_companycontextguard.CompanyContextGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _techniciansservice.TechniciansService === "undefined" ? Object : _techniciansservice.TechniciansService
    ])
], TechniciansController);

//# sourceMappingURL=technicians.controller.js.map
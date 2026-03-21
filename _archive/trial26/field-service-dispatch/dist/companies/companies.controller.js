"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CompaniesController", {
    enumerable: true,
    get: function() {
        return CompaniesController;
    }
});
const _common = require("@nestjs/common");
const _companiesservice = require("./companies.service");
const _createcompanydto = require("./dto/create-company.dto");
const _updatecompanydto = require("./dto/update-company.dto");
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
let CompaniesController = class CompaniesController {
    create(dto) {
        return this.companiesService.create(dto);
    }
    findAll() {
        return this.companiesService.findAll();
    }
    findOne(id) {
        return this.companiesService.findOne(id);
    }
    update(id, dto) {
        return this.companiesService.update(id, dto);
    }
    delete(id) {
        return this.companiesService.delete(id);
    }
    constructor(companiesService){
        this.companiesService = companiesService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createcompanydto.CreateCompanyDto === "undefined" ? Object : _createcompanydto.CreateCompanyDto
    ]),
    _ts_metadata("design:returntype", void 0)
], CompaniesController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], CompaniesController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CompaniesController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatecompanydto.UpdateCompanyDto === "undefined" ? Object : _updatecompanydto.UpdateCompanyDto
    ]),
    _ts_metadata("design:returntype", void 0)
], CompaniesController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CompaniesController.prototype, "delete", null);
CompaniesController = _ts_decorate([
    (0, _common.Controller)('companies'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _companiesservice.CompaniesService === "undefined" ? Object : _companiesservice.CompaniesService
    ])
], CompaniesController);

//# sourceMappingURL=companies.controller.js.map
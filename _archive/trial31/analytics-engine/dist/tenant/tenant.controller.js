"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TenantController", {
    enumerable: true,
    get: function() {
        return TenantController;
    }
});
const _common = require("@nestjs/common");
const _tenantservice = require("./tenant.service");
const _createtenantdto = require("./dto/create-tenant.dto");
const _updatetenantdto = require("./dto/update-tenant.dto");
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
let TenantController = class TenantController {
    create(dto) {
        return this.tenantService.create(dto);
    }
    findAll() {
        return this.tenantService.findAll();
    }
    findOne(id) {
        return this.tenantService.findOne(id);
    }
    update(id, dto) {
        return this.tenantService.update(id, dto);
    }
    remove(id) {
        return this.tenantService.remove(id);
    }
    regenerateApiKey(id) {
        return this.tenantService.regenerateApiKey(id);
    }
    constructor(tenantService){
        this.tenantService = tenantService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createtenantdto.CreateTenantDto === "undefined" ? Object : _createtenantdto.CreateTenantDto
    ]),
    _ts_metadata("design:returntype", void 0)
], TenantController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], TenantController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], TenantController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatetenantdto.UpdateTenantDto === "undefined" ? Object : _updatetenantdto.UpdateTenantDto
    ]),
    _ts_metadata("design:returntype", void 0)
], TenantController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], TenantController.prototype, "remove", null);
_ts_decorate([
    (0, _common.Post)(':id/regenerate-api-key'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], TenantController.prototype, "regenerateApiKey", null);
TenantController = _ts_decorate([
    (0, _common.Controller)('tenants'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _tenantservice.TenantService === "undefined" ? Object : _tenantservice.TenantService
    ])
], TenantController);

//# sourceMappingURL=tenant.controller.js.map
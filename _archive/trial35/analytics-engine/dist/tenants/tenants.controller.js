"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TenantsController", {
    enumerable: true,
    get: function() {
        return TenantsController;
    }
});
const _common = require("@nestjs/common");
const _tenantsservice = require("./tenants.service");
const _createtenantdto = require("./dto/create-tenant.dto");
const _updatetenantdto = require("./dto/update-tenant.dto");
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
let TenantsController = class TenantsController {
    create(dto) {
        return this.tenantsService.create(dto);
    }
    findAll() {
        return this.tenantsService.findAll();
    }
    findById(id) {
        return this.tenantsService.findById(id);
    }
    update(id, dto) {
        return this.tenantsService.update(id, dto);
    }
    remove(id) {
        return this.tenantsService.remove(id);
    }
    constructor(tenantsService){
        this.tenantsService = tenantsService;
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
], TenantsController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], TenantsController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], TenantsController.prototype, "findById", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatetenantdto.UpdateTenantDto === "undefined" ? Object : _updatetenantdto.UpdateTenantDto
    ]),
    _ts_metadata("design:returntype", void 0)
], TenantsController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], TenantsController.prototype, "remove", null);
TenantsController = _ts_decorate([
    (0, _common.Controller)('tenants'),
    (0, _common.UseFilters)(_prismaexceptionfilter.PrismaExceptionFilter),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _tenantsservice.TenantsService === "undefined" ? Object : _tenantsservice.TenantsService
    ])
], TenantsController);

//# sourceMappingURL=tenants.controller.js.map
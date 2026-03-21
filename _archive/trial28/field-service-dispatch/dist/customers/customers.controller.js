"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CustomersController", {
    enumerable: true,
    get: function() {
        return CustomersController;
    }
});
const _common = require("@nestjs/common");
const _companycontextguard = require("../common/guards/company-context.guard");
const _companyiddecorator = require("../common/decorators/company-id.decorator");
const _customersservice = require("./customers.service");
const _createcustomerdto = require("./dto/create-customer.dto");
const _updatecustomerdto = require("./dto/update-customer.dto");
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
let CustomersController = class CustomersController {
    create(companyId, dto) {
        return this.customersService.create(companyId, dto);
    }
    findAll(companyId) {
        return this.customersService.findAll(companyId);
    }
    findOne(companyId, id) {
        return this.customersService.findOne(companyId, id);
    }
    update(companyId, id, dto) {
        return this.customersService.update(companyId, id, dto);
    }
    delete(companyId, id) {
        return this.customersService.delete(companyId, id);
    }
    constructor(customersService){
        this.customersService = customersService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _createcustomerdto.CreateCustomerDto === "undefined" ? Object : _createcustomerdto.CreateCustomerDto
    ]),
    _ts_metadata("design:returntype", void 0)
], CustomersController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CustomersController.prototype, "findAll", null);
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
], CustomersController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_param(2, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        typeof _updatecustomerdto.UpdateCustomerDto === "undefined" ? Object : _updatecustomerdto.UpdateCustomerDto
    ]),
    _ts_metadata("design:returntype", void 0)
], CustomersController.prototype, "update", null);
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
], CustomersController.prototype, "delete", null);
CustomersController = _ts_decorate([
    (0, _common.Controller)('customers'),
    (0, _common.UseGuards)(_companycontextguard.CompanyContextGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _customersservice.CustomersService === "undefined" ? Object : _customersservice.CustomersService
    ])
], CustomersController);

//# sourceMappingURL=customers.controller.js.map
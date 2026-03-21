"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InvoicesController", {
    enumerable: true,
    get: function() {
        return InvoicesController;
    }
});
const _common = require("@nestjs/common");
const _companycontextguard = require("../common/guards/company-context.guard");
const _companyiddecorator = require("../common/decorators/company-id.decorator");
const _invoicesservice = require("./invoices.service");
const _createinvoicedto = require("./dto/create-invoice.dto");
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
let InvoicesController = class InvoicesController {
    create(companyId, dto) {
        return this.invoicesService.create(companyId, dto);
    }
    findAll(companyId) {
        return this.invoicesService.findAll(companyId);
    }
    findOne(id) {
        return this.invoicesService.findOne(id);
    }
    markAsSent(id) {
        return this.invoicesService.markAsSent(id);
    }
    markAsPaid(id) {
        return this.invoicesService.markAsPaid(id);
    }
    voidInvoice(id) {
        return this.invoicesService.voidInvoice(id);
    }
    constructor(invoicesService){
        this.invoicesService = invoicesService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _createinvoicedto.CreateInvoiceDto === "undefined" ? Object : _createinvoicedto.CreateInvoiceDto
    ]),
    _ts_metadata("design:returntype", void 0)
], InvoicesController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], InvoicesController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], InvoicesController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Patch)(':id/send'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], InvoicesController.prototype, "markAsSent", null);
_ts_decorate([
    (0, _common.Patch)(':id/pay'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], InvoicesController.prototype, "markAsPaid", null);
_ts_decorate([
    (0, _common.Patch)(':id/void'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], InvoicesController.prototype, "voidInvoice", null);
InvoicesController = _ts_decorate([
    (0, _common.Controller)('invoices'),
    (0, _common.UseGuards)(_companycontextguard.CompanyContextGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _invoicesservice.InvoicesService === "undefined" ? Object : _invoicesservice.InvoicesService
    ])
], InvoicesController);

//# sourceMappingURL=invoices.controller.js.map
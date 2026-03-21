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
exports.InvoiceController = void 0;
const common_1 = require("@nestjs/common");
const invoice_service_js_1 = require("./invoice.service.js");
const create_invoice_dto_js_1 = require("./dto/create-invoice.dto.js");
let InvoiceController = class InvoiceController {
    invoiceService;
    constructor(invoiceService) {
        this.invoiceService = invoiceService;
    }
    createFromWorkOrder(workOrderId, dto, req) {
        const companyId = req.companyId;
        return this.invoiceService.createFromWorkOrder(workOrderId, companyId, dto.amount);
    }
    markPaid(id, req) {
        const companyId = req.companyId;
        return this.invoiceService.markPaid(id, companyId);
    }
    findAll(req) {
        const companyId = req.companyId;
        return this.invoiceService.findAllByCompany(companyId);
    }
};
exports.InvoiceController = InvoiceController;
__decorate([
    (0, common_1.Post)('invoices/work-order/:workOrderId'),
    __param(0, (0, common_1.Param)('workOrderId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_invoice_dto_js_1.CreateInvoiceDto, Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "createFromWorkOrder", null);
__decorate([
    (0, common_1.Patch)('invoices/:id/pay'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "markPaid", null);
__decorate([
    (0, common_1.Get)('invoices'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "findAll", null);
exports.InvoiceController = InvoiceController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [invoice_service_js_1.InvoiceService])
], InvoiceController);
//# sourceMappingURL=invoice.controller.js.map
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const work_order_service_js_1 = require("../work-order/work-order.service.js");
let InvoiceService = class InvoiceService {
    prisma;
    workOrderService;
    constructor(prisma, workOrderService) {
        this.prisma = prisma;
        this.workOrderService = workOrderService;
    }
    async createFromWorkOrder(workOrderId, companyId, amount) {
        await this.workOrderService.transition(workOrderId, companyId, 'INVOICED');
        return this.prisma.invoice.create({
            data: {
                workOrderId,
                amount,
            },
        });
    }
    async markPaid(id, companyId) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: { workOrder: true },
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice ${id} not found`);
        }
        await this.workOrderService.transition(invoice.workOrderId, companyId, 'PAID');
        return this.prisma.invoice.update({
            where: { id },
            data: { status: 'PAID' },
        });
    }
    async findAllByCompany(companyId) {
        return this.prisma.invoice.findMany({
            where: { workOrder: { companyId } },
            include: { workOrder: true },
        });
    }
};
exports.InvoiceService = InvoiceService;
exports.InvoiceService = InvoiceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService,
        work_order_service_js_1.WorkOrderService])
], InvoiceService);
//# sourceMappingURL=invoice.service.js.map
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InvoicesService", {
    enumerable: true,
    get: function() {
        return InvoicesService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../prisma/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let InvoicesService = class InvoicesService {
    async create(dto) {
        return this.prisma.invoice.create({
            data: {
                workOrderId: dto.workOrderId,
                amount: dto.amount,
                status: dto.status || 'DRAFT'
            },
            include: {
                workOrder: true
            }
        });
    }
    async findAll() {
        return this.prisma.invoice.findMany({
            include: {
                workOrder: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async findOne(id) {
        const invoice = await this.prisma.invoice.findUnique({
            where: {
                id
            },
            include: {
                workOrder: true
            }
        });
        if (!invoice) {
            throw new _common.NotFoundException(`Invoice ${id} not found`);
        }
        return invoice;
    }
    async findByWorkOrder(workOrderId) {
        return this.prisma.invoice.findUnique({
            where: {
                workOrderId
            },
            include: {
                workOrder: true
            }
        });
    }
    async markPaid(id, stripePaymentIntentId) {
        await this.findOne(id);
        return this.prisma.invoice.update({
            where: {
                id
            },
            data: {
                status: 'PAID',
                stripePaymentIntentId
            },
            include: {
                workOrder: true
            }
        });
    }
    async delete(id) {
        await this.findOne(id);
        return this.prisma.invoice.delete({
            where: {
                id
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
InvoicesService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], InvoicesService);

//# sourceMappingURL=invoices.service.js.map
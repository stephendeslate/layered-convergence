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
const _client = require("@prisma/client");
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
    async create(companyId, dto) {
        const workOrder = await this.prisma.workOrder.findFirst({
            where: {
                id: dto.workOrderId,
                companyId
            }
        });
        if (!workOrder) {
            throw new _common.NotFoundException(`Work order ${dto.workOrderId} not found`);
        }
        if (workOrder.status !== _client.WorkOrderStatus.COMPLETED) {
            throw new _common.BadRequestException('Can only create invoices for completed work orders');
        }
        const invoice = await this.prisma.invoice.create({
            data: {
                workOrderId: dto.workOrderId,
                amount: dto.amount,
                status: _client.InvoiceStatus.DRAFT
            },
            include: {
                workOrder: true
            }
        });
        await this.prisma.workOrder.update({
            where: {
                id: dto.workOrderId
            },
            data: {
                status: _client.WorkOrderStatus.INVOICED
            }
        });
        await this.prisma.workOrderStatusHistory.create({
            data: {
                workOrderId: dto.workOrderId,
                fromStatus: _client.WorkOrderStatus.COMPLETED,
                toStatus: _client.WorkOrderStatus.INVOICED,
                note: `Invoice created: $${dto.amount}`
            }
        });
        return invoice;
    }
    async findAll(companyId) {
        return this.prisma.invoice.findMany({
            where: {
                workOrder: {
                    companyId
                }
            },
            include: {
                workOrder: {
                    include: {
                        customer: true,
                        technician: true
                    }
                }
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
                workOrder: {
                    include: {
                        customer: true,
                        technician: true
                    }
                }
            }
        });
        if (!invoice) {
            throw new _common.NotFoundException(`Invoice ${id} not found`);
        }
        return invoice;
    }
    async markAsSent(id) {
        const invoice = await this.findOne(id);
        if (invoice.status !== _client.InvoiceStatus.DRAFT) {
            throw new _common.BadRequestException('Can only send draft invoices');
        }
        return this.prisma.invoice.update({
            where: {
                id
            },
            data: {
                status: _client.InvoiceStatus.SENT
            }
        });
    }
    async markAsPaid(id, stripePaymentIntentId) {
        const invoice = await this.findOne(id);
        if (invoice.status !== _client.InvoiceStatus.SENT && invoice.status !== _client.InvoiceStatus.DRAFT) {
            throw new _common.BadRequestException('Can only pay sent or draft invoices');
        }
        const [updatedInvoice] = await this.prisma.$transaction([
            this.prisma.invoice.update({
                where: {
                    id
                },
                data: {
                    status: _client.InvoiceStatus.PAID,
                    stripePaymentIntentId
                }
            }),
            this.prisma.workOrder.update({
                where: {
                    id: invoice.workOrderId
                },
                data: {
                    status: _client.WorkOrderStatus.PAID
                }
            }),
            this.prisma.workOrderStatusHistory.create({
                data: {
                    workOrderId: invoice.workOrderId,
                    fromStatus: _client.WorkOrderStatus.INVOICED,
                    toStatus: _client.WorkOrderStatus.PAID,
                    note: 'Payment received'
                }
            })
        ]);
        return updatedInvoice;
    }
    async voidInvoice(id) {
        const invoice = await this.findOne(id);
        if (invoice.status === _client.InvoiceStatus.PAID) {
            throw new _common.BadRequestException('Cannot void a paid invoice');
        }
        return this.prisma.invoice.update({
            where: {
                id
            },
            data: {
                status: _client.InvoiceStatus.VOID
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
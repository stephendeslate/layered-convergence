import { Request } from 'express';
import { InvoiceService } from './invoice.service.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';
export declare class InvoiceController {
    private readonly invoiceService;
    constructor(invoiceService: InvoiceService);
    createFromWorkOrder(workOrderId: string, dto: CreateInvoiceDto, req: Request): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("../../generated/prisma/enums.js").InvoiceStatus;
        workOrderId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
    }>;
    markPaid(id: string, req: Request): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("../../generated/prisma/enums.js").InvoiceStatus;
        workOrderId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(req: Request): Promise<({
        workOrder: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            status: import("../../generated/prisma/enums.js").WorkOrderStatus;
            customerId: string;
            technicianId: string | null;
            priority: import("../../generated/prisma/enums.js").WorkOrderPriority;
            scheduledAt: Date | null;
            description: string;
            notes: string | null;
            completedAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("../../generated/prisma/enums.js").InvoiceStatus;
        workOrderId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
    })[]>;
}

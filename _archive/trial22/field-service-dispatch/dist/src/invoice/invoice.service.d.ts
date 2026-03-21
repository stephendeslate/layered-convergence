import { PrismaService } from '../prisma/prisma.service.js';
import { WorkOrderService } from '../work-order/work-order.service.js';
export declare class InvoiceService {
    private readonly prisma;
    private readonly workOrderService;
    constructor(prisma: PrismaService, workOrderService: WorkOrderService);
    createFromWorkOrder(workOrderId: string, companyId: string, amount: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("../../generated/prisma/enums.js").InvoiceStatus;
        workOrderId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
    }>;
    markPaid(id: string, companyId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("../../generated/prisma/enums.js").InvoiceStatus;
        workOrderId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAllByCompany(companyId: string): Promise<({
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

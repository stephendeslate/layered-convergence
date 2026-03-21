export declare const TechnicianStatus: {
    readonly AVAILABLE: "AVAILABLE";
    readonly BUSY: "BUSY";
    readonly OFFLINE: "OFFLINE";
};
export type TechnicianStatus = (typeof TechnicianStatus)[keyof typeof TechnicianStatus];
export declare const WorkOrderPriority: {
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly HIGH: "HIGH";
    readonly URGENT: "URGENT";
};
export type WorkOrderPriority = (typeof WorkOrderPriority)[keyof typeof WorkOrderPriority];
export declare const WorkOrderStatus: {
    readonly UNASSIGNED: "UNASSIGNED";
    readonly ASSIGNED: "ASSIGNED";
    readonly EN_ROUTE: "EN_ROUTE";
    readonly ON_SITE: "ON_SITE";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly COMPLETED: "COMPLETED";
    readonly INVOICED: "INVOICED";
    readonly PAID: "PAID";
};
export type WorkOrderStatus = (typeof WorkOrderStatus)[keyof typeof WorkOrderStatus];
export declare const InvoiceStatus: {
    readonly DRAFT: "DRAFT";
    readonly SENT: "SENT";
    readonly PAID: "PAID";
    readonly CANCELLED: "CANCELLED";
};
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

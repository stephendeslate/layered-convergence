"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceStatus = exports.WorkOrderStatus = exports.WorkOrderPriority = exports.TechnicianStatus = void 0;
exports.TechnicianStatus = {
    AVAILABLE: 'AVAILABLE',
    BUSY: 'BUSY',
    OFFLINE: 'OFFLINE'
};
exports.WorkOrderPriority = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT'
};
exports.WorkOrderStatus = {
    UNASSIGNED: 'UNASSIGNED',
    ASSIGNED: 'ASSIGNED',
    EN_ROUTE: 'EN_ROUTE',
    ON_SITE: 'ON_SITE',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    INVOICED: 'INVOICED',
    PAID: 'PAID'
};
exports.InvoiceStatus = {
    DRAFT: 'DRAFT',
    SENT: 'SENT',
    PAID: 'PAID',
    CANCELLED: 'CANCELLED'
};
//# sourceMappingURL=enums.js.map
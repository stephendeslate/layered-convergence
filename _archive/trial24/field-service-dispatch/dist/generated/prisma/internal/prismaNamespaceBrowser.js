"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonNullValueFilter = exports.NullsOrder = exports.QueryMode = exports.NullableJsonNullValueInput = exports.JsonNullValueInput = exports.SortOrder = exports.InvoiceScalarFieldEnum = exports.RouteScalarFieldEnum = exports.WorkOrderStatusHistoryScalarFieldEnum = exports.WorkOrderScalarFieldEnum = exports.CustomerScalarFieldEnum = exports.TechnicianScalarFieldEnum = exports.CompanyScalarFieldEnum = exports.TransactionIsolationLevel = exports.ModelName = exports.AnyNull = exports.JsonNull = exports.DbNull = exports.NullTypes = exports.Decimal = void 0;
const runtime = __importStar(require("@prisma/client/runtime/index-browser"));
exports.Decimal = runtime.Decimal;
exports.NullTypes = {
    DbNull: runtime.objectEnumValues.classes.DbNull,
    JsonNull: runtime.objectEnumValues.classes.JsonNull,
    AnyNull: runtime.objectEnumValues.classes.AnyNull,
};
exports.DbNull = runtime.objectEnumValues.instances.DbNull;
exports.JsonNull = runtime.objectEnumValues.instances.JsonNull;
exports.AnyNull = runtime.objectEnumValues.instances.AnyNull;
exports.ModelName = {
    Company: 'Company',
    Technician: 'Technician',
    Customer: 'Customer',
    WorkOrder: 'WorkOrder',
    WorkOrderStatusHistory: 'WorkOrderStatusHistory',
    Route: 'Route',
    Invoice: 'Invoice'
};
exports.TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
exports.CompanyScalarFieldEnum = {
    id: 'id',
    name: 'name',
    serviceArea: 'serviceArea',
    primaryColor: 'primaryColor',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.TechnicianScalarFieldEnum = {
    id: 'id',
    companyId: 'companyId',
    name: 'name',
    email: 'email',
    skills: 'skills',
    phone: 'phone',
    currentLat: 'currentLat',
    currentLng: 'currentLng',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.CustomerScalarFieldEnum = {
    id: 'id',
    companyId: 'companyId',
    name: 'name',
    email: 'email',
    address: 'address',
    lat: 'lat',
    lng: 'lng',
    phone: 'phone',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.WorkOrderScalarFieldEnum = {
    id: 'id',
    companyId: 'companyId',
    customerId: 'customerId',
    technicianId: 'technicianId',
    priority: 'priority',
    scheduledAt: 'scheduledAt',
    status: 'status',
    description: 'description',
    notes: 'notes',
    completedAt: 'completedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.WorkOrderStatusHistoryScalarFieldEnum = {
    id: 'id',
    workOrderId: 'workOrderId',
    fromStatus: 'fromStatus',
    toStatus: 'toStatus',
    note: 'note',
    createdAt: 'createdAt'
};
exports.RouteScalarFieldEnum = {
    id: 'id',
    technicianId: 'technicianId',
    date: 'date',
    waypoints: 'waypoints',
    optimizedOrder: 'optimizedOrder',
    estimatedDuration: 'estimatedDuration',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.InvoiceScalarFieldEnum = {
    id: 'id',
    workOrderId: 'workOrderId',
    amount: 'amount',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
exports.JsonNullValueInput = {
    JsonNull: exports.JsonNull
};
exports.NullableJsonNullValueInput = {
    DbNull: exports.DbNull,
    JsonNull: exports.JsonNull
};
exports.QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
exports.NullsOrder = {
    first: 'first',
    last: 'last'
};
exports.JsonNullValueFilter = {
    DbNull: exports.DbNull,
    JsonNull: exports.JsonNull,
    AnyNull: exports.AnyNull
};
//# sourceMappingURL=prismaNamespaceBrowser.js.map
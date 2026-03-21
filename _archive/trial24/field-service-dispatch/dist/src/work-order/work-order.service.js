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
exports.WorkOrderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const VALID_TRANSITIONS = {
    UNASSIGNED: ['ASSIGNED'],
    ASSIGNED: ['EN_ROUTE', 'UNASSIGNED'],
    EN_ROUTE: ['ON_SITE', 'ASSIGNED'],
    ON_SITE: ['IN_PROGRESS'],
    IN_PROGRESS: ['COMPLETED'],
    COMPLETED: ['INVOICED'],
    INVOICED: ['PAID'],
    PAID: [],
};
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
let WorkOrderService = class WorkOrderService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.workOrder.create({
            data: {
                companyId: dto.companyId,
                customerId: dto.customerId,
                technicianId: dto.technicianId,
                priority: dto.priority,
                scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
                description: dto.description,
                notes: dto.notes,
                status: dto.technicianId ? 'ASSIGNED' : 'UNASSIGNED',
            },
        });
    }
    async findAllByCompany(companyId) {
        return this.prisma.workOrder.findMany({
            where: { companyId },
            include: { customer: true, technician: true },
        });
    }
    async findOne(id, companyId) {
        const workOrder = await this.prisma.workOrder.findFirst({
            where: { id, companyId },
            include: { customer: true, technician: true, statusHistory: true },
        });
        if (!workOrder) {
            throw new common_1.NotFoundException(`Work order ${id} not found`);
        }
        return workOrder;
    }
    async transition(id, companyId, toStatus, data) {
        const workOrder = await this.findOne(id, companyId);
        const fromStatus = workOrder.status;
        const allowed = VALID_TRANSITIONS[fromStatus];
        if (!allowed || !allowed.includes(toStatus)) {
            throw new common_1.BadRequestException(`Invalid transition from ${fromStatus} to ${toStatus}`);
        }
        const updateData = { status: toStatus };
        if (data?.technicianId) {
            updateData.technicianId = data.technicianId;
        }
        if (toStatus === 'UNASSIGNED') {
            updateData.technicianId = null;
        }
        if (toStatus === 'COMPLETED') {
            updateData.completedAt = new Date();
        }
        const [updated] = await this.prisma.$transaction([
            this.prisma.workOrder.update({
                where: { id },
                data: updateData,
            }),
            this.prisma.workOrderStatusHistory.create({
                data: {
                    workOrderId: id,
                    fromStatus,
                    toStatus,
                    note: data?.note,
                },
            }),
        ]);
        return updated;
    }
    async assign(id, companyId, technicianId) {
        return this.transition(id, companyId, 'ASSIGNED', { technicianId });
    }
    async unassign(id, companyId) {
        return this.transition(id, companyId, 'UNASSIGNED');
    }
    async enRoute(id, companyId) {
        return this.transition(id, companyId, 'EN_ROUTE');
    }
    async onSite(id, companyId) {
        return this.transition(id, companyId, 'ON_SITE');
    }
    async start(id, companyId) {
        return this.transition(id, companyId, 'IN_PROGRESS');
    }
    async complete(id, companyId) {
        return this.transition(id, companyId, 'COMPLETED');
    }
    async returnToAssigned(id, companyId) {
        return this.transition(id, companyId, 'ASSIGNED');
    }
    async autoAssign(id, companyId) {
        const workOrder = await this.findOne(id, companyId);
        if (workOrder.status !== 'UNASSIGNED') {
            throw new common_1.BadRequestException(`Work order must be UNASSIGNED to auto-assign, current status: ${workOrder.status}`);
        }
        const customerLat = workOrder.customer.lat
            ? Number(workOrder.customer.lat)
            : null;
        const customerLng = workOrder.customer.lng
            ? Number(workOrder.customer.lng)
            : null;
        const availableTechnicians = await this.prisma.technician.findMany({
            where: {
                companyId,
                status: 'AVAILABLE',
            },
        });
        if (availableTechnicians.length === 0) {
            throw new common_1.BadRequestException('No available technicians found');
        }
        let bestTechnician = availableTechnicians[0];
        if (customerLat !== null && customerLng !== null) {
            let bestDistance = Infinity;
            for (const tech of availableTechnicians) {
                if (tech.currentLat !== null && tech.currentLng !== null) {
                    const techLat = Number(tech.currentLat);
                    const techLng = Number(tech.currentLng);
                    const distance = haversineDistance(customerLat, customerLng, techLat, techLng);
                    if (distance < bestDistance) {
                        bestDistance = distance;
                        bestTechnician = tech;
                    }
                }
            }
        }
        return this.transition(id, companyId, 'ASSIGNED', {
            technicianId: bestTechnician.id,
        });
    }
};
exports.WorkOrderService = WorkOrderService;
exports.WorkOrderService = WorkOrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], WorkOrderService);
//# sourceMappingURL=work-order.service.js.map
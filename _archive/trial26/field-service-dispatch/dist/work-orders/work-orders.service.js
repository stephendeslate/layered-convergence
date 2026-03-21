"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WorkOrdersService", {
    enumerable: true,
    get: function() {
        return WorkOrdersService;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _prismaservice = require("../prisma/prisma.service");
const _workorderstatemachine = require("./work-order-state-machine");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let WorkOrdersService = class WorkOrdersService {
    async create(companyId, dto) {
        const status = dto.technicianId ? _client.WorkOrderStatus.ASSIGNED : _client.WorkOrderStatus.UNASSIGNED;
        return this.prisma.workOrder.create({
            data: {
                companyId,
                customerId: dto.customerId,
                technicianId: dto.technicianId,
                title: dto.title,
                description: dto.description,
                priority: dto.priority,
                scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
                status
            },
            include: {
                customer: true,
                technician: true
            }
        });
    }
    async findAll(companyId, status) {
        return this.prisma.workOrder.findMany({
            where: {
                companyId,
                ...status && {
                    status
                }
            },
            include: {
                customer: true,
                technician: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async findOne(companyId, id) {
        const workOrder = await this.prisma.workOrder.findFirst({
            where: {
                id,
                companyId
            },
            include: {
                customer: true,
                technician: true,
                statusHistory: {
                    orderBy: {
                        changedAt: 'desc'
                    }
                },
                photos: true,
                invoice: true
            }
        });
        if (!workOrder) {
            throw new _common.NotFoundException(`Work order ${id} not found`);
        }
        return workOrder;
    }
    async update(companyId, id, dto) {
        await this.findOne(companyId, id);
        return this.prisma.workOrder.update({
            where: {
                id
            },
            data: {
                title: dto.title,
                description: dto.description,
                priority: dto.priority,
                scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
                technicianId: dto.technicianId
            },
            include: {
                customer: true,
                technician: true
            }
        });
    }
    async transitionStatus(companyId, id, toStatus, note) {
        const workOrder = await this.findOne(companyId, id);
        (0, _workorderstatemachine.validateTransition)(workOrder.status, toStatus);
        const completedAt = toStatus === _client.WorkOrderStatus.COMPLETED ? new Date() : undefined;
        const [updated] = await this.prisma.$transaction([
            this.prisma.workOrder.update({
                where: {
                    id
                },
                data: {
                    status: toStatus,
                    ...completedAt && {
                        completedAt
                    },
                    ...toStatus === _client.WorkOrderStatus.ASSIGNED && workOrder.status === _client.WorkOrderStatus.UNASSIGNED && {
                        technicianId: workOrder.technicianId
                    }
                },
                include: {
                    customer: true,
                    technician: true
                }
            }),
            this.prisma.workOrderStatusHistory.create({
                data: {
                    workOrderId: id,
                    fromStatus: workOrder.status,
                    toStatus,
                    note
                }
            })
        ]);
        return updated;
    }
    async assignTechnician(companyId, workOrderId, technicianId) {
        const workOrder = await this.findOne(companyId, workOrderId);
        if (workOrder.status !== _client.WorkOrderStatus.UNASSIGNED && workOrder.status !== _client.WorkOrderStatus.ASSIGNED) {
            throw new _common.BadRequestException('Can only assign technician to UNASSIGNED or ASSIGNED work orders');
        }
        const [updated] = await this.prisma.$transaction([
            this.prisma.workOrder.update({
                where: {
                    id: workOrderId
                },
                data: {
                    technicianId,
                    status: _client.WorkOrderStatus.ASSIGNED
                },
                include: {
                    customer: true,
                    technician: true
                }
            }),
            this.prisma.workOrderStatusHistory.create({
                data: {
                    workOrderId,
                    fromStatus: workOrder.status,
                    toStatus: _client.WorkOrderStatus.ASSIGNED,
                    note: `Assigned to technician ${technicianId}`
                }
            })
        ]);
        return updated;
    }
    async delete(companyId, id) {
        await this.findOne(companyId, id);
        return this.prisma.workOrder.delete({
            where: {
                id
            }
        });
    }
    async autoAssign(companyId, workOrderId) {
        const workOrder = await this.findOne(companyId, workOrderId);
        if (workOrder.status !== _client.WorkOrderStatus.UNASSIGNED) {
            throw new _common.BadRequestException('Can only auto-assign UNASSIGNED work orders');
        }
        const customer = workOrder.customer;
        const availableTechnicians = await this.prisma.technician.findMany({
            where: {
                companyId,
                status: 'AVAILABLE'
            }
        });
        if (availableTechnicians.length === 0) {
            throw new _common.BadRequestException('No available technicians');
        }
        let nearest = availableTechnicians[0];
        let minDistance = Infinity;
        for (const tech of availableTechnicians){
            if (tech.currentLat != null && tech.currentLng != null && customer.lat != null && customer.lng != null) {
                const dist = Math.sqrt(Math.pow(tech.currentLat - customer.lat, 2) + Math.pow(tech.currentLng - customer.lng, 2));
                if (dist < minDistance) {
                    minDistance = dist;
                    nearest = tech;
                }
            }
        }
        return this.assignTechnician(companyId, workOrderId, nearest.id);
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
WorkOrdersService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], WorkOrdersService);

//# sourceMappingURL=work-orders.service.js.map
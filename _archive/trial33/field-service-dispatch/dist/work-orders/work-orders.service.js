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
        const status = dto.technicianId ? 'ASSIGNED' : 'UNASSIGNED';
        return this.prisma.workOrder.create({
            data: {
                companyId,
                customerId: dto.customerId,
                technicianId: dto.technicianId,
                title: dto.title,
                description: dto.description,
                priority: dto.priority || 'MEDIUM',
                status,
                scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined
            },
            include: {
                customer: true,
                technician: true
            }
        });
    }
    async findAll(companyId) {
        return this.prisma.workOrder.findMany({
            where: {
                companyId
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
                technicianId: dto.technicianId,
                title: dto.title,
                description: dto.description,
                priority: dto.priority,
                scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined
            },
            include: {
                customer: true,
                technician: true
            }
        });
    }
    async transitionStatus(companyId, id, dto) {
        const workOrder = await this.findOne(companyId, id);
        const fromStatus = workOrder.status;
        const toStatus = dto.status;
        (0, _workorderstatemachine.validateTransition)(fromStatus, toStatus);
        const [updated] = await this.prisma.$transaction([
            this.prisma.workOrder.update({
                where: {
                    id
                },
                data: {
                    status: toStatus,
                    completedAt: toStatus === 'COMPLETED' ? new Date() : undefined
                },
                include: {
                    customer: true,
                    technician: true
                }
            }),
            this.prisma.workOrderStatusHistory.create({
                data: {
                    workOrderId: id,
                    fromStatus,
                    toStatus,
                    note: dto.note
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
    async autoAssign(companyId, id) {
        const workOrder = await this.findOne(companyId, id);
        if (workOrder.status !== 'UNASSIGNED') {
            return workOrder;
        }
        const customer = workOrder.customer;
        if (!customer.lat || !customer.lng) {
            return workOrder;
        }
        const available = await this.prisma.technician.findMany({
            where: {
                companyId,
                status: 'AVAILABLE'
            }
        });
        if (available.length === 0) {
            return workOrder;
        }
        let nearest = available[0];
        let minDist = Infinity;
        for (const tech of available){
            if (tech.currentLat !== null && tech.currentLng !== null) {
                const dist = Math.sqrt(Math.pow(tech.currentLat - customer.lat, 2) + Math.pow(tech.currentLng - customer.lng, 2));
                if (dist < minDist) {
                    minDist = dist;
                    nearest = tech;
                }
            }
        }
        const [updated] = await this.prisma.$transaction([
            this.prisma.workOrder.update({
                where: {
                    id
                },
                data: {
                    technicianId: nearest.id,
                    status: 'ASSIGNED'
                },
                include: {
                    customer: true,
                    technician: true
                }
            }),
            this.prisma.workOrderStatusHistory.create({
                data: {
                    workOrderId: id,
                    fromStatus: 'UNASSIGNED',
                    toStatus: 'ASSIGNED',
                    note: `Auto-assigned to ${nearest.name}`
                }
            })
        ]);
        return updated;
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
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkOrderController = void 0;
const common_1 = require("@nestjs/common");
const work_order_service_js_1 = require("./work-order.service.js");
const create_work_order_dto_js_1 = require("./dto/create-work-order.dto.js");
const transition_work_order_dto_js_1 = require("./dto/transition-work-order.dto.js");
const assign_work_order_dto_js_1 = require("./dto/assign-work-order.dto.js");
let WorkOrderController = class WorkOrderController {
    workOrderService;
    constructor(workOrderService) {
        this.workOrderService = workOrderService;
    }
    create(dto) {
        return this.workOrderService.create(dto);
    }
    findAll(req) {
        const companyId = req.companyId;
        return this.workOrderService.findAllByCompany(companyId);
    }
    findOne(id, req) {
        const companyId = req.companyId;
        return this.workOrderService.findOne(id, companyId);
    }
    assign(id, dto, req) {
        const companyId = req.companyId;
        return this.workOrderService.assign(id, companyId, dto.technicianId);
    }
    transition(id, dto, req) {
        const companyId = req.companyId;
        return this.workOrderService.transition(id, companyId, dto.status, { technicianId: dto.technicianId, note: dto.note });
    }
    unassign(id, req) {
        const companyId = req.companyId;
        return this.workOrderService.unassign(id, companyId);
    }
    enRoute(id, req) {
        const companyId = req.companyId;
        return this.workOrderService.enRoute(id, companyId);
    }
    onSite(id, req) {
        const companyId = req.companyId;
        return this.workOrderService.onSite(id, companyId);
    }
    start(id, req) {
        const companyId = req.companyId;
        return this.workOrderService.start(id, companyId);
    }
    complete(id, req) {
        const companyId = req.companyId;
        return this.workOrderService.complete(id, companyId);
    }
    returnToAssigned(id, req) {
        const companyId = req.companyId;
        return this.workOrderService.returnToAssigned(id, companyId);
    }
    autoAssign(id, req) {
        const companyId = req.companyId;
        return this.workOrderService.autoAssign(id, companyId);
    }
};
exports.WorkOrderController = WorkOrderController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_work_order_dto_js_1.CreateWorkOrderDto]),
    __metadata("design:returntype", void 0)
], WorkOrderController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkOrderController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkOrderController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/assign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_work_order_dto_js_1.AssignWorkOrderDto, Object]),
    __metadata("design:returntype", void 0)
], WorkOrderController.prototype, "assign", null);
__decorate([
    (0, common_1.Patch)(':id/transition'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transition_work_order_dto_js_1.TransitionWorkOrderDto, Object]),
    __metadata("design:returntype", void 0)
], WorkOrderController.prototype, "transition", null);
__decorate([
    (0, common_1.Patch)(':id/unassign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkOrderController.prototype, "unassign", null);
__decorate([
    (0, common_1.Patch)(':id/en-route'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkOrderController.prototype, "enRoute", null);
__decorate([
    (0, common_1.Patch)(':id/on-site'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkOrderController.prototype, "onSite", null);
__decorate([
    (0, common_1.Patch)(':id/start'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkOrderController.prototype, "start", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkOrderController.prototype, "complete", null);
__decorate([
    (0, common_1.Patch)(':id/return-to-assigned'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkOrderController.prototype, "returnToAssigned", null);
__decorate([
    (0, common_1.Post)(':id/auto-assign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkOrderController.prototype, "autoAssign", null);
exports.WorkOrderController = WorkOrderController = __decorate([
    (0, common_1.Controller)('work-orders'),
    __metadata("design:paramtypes", [work_order_service_js_1.WorkOrderService])
], WorkOrderController);
//# sourceMappingURL=work-order.controller.js.map
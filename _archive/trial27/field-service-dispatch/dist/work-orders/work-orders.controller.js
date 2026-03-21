"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WorkOrdersController", {
    enumerable: true,
    get: function() {
        return WorkOrdersController;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _companycontextguard = require("../common/guards/company-context.guard");
const _companyiddecorator = require("../common/decorators/company-id.decorator");
const _workordersservice = require("./work-orders.service");
const _createworkorderdto = require("./dto/create-work-order.dto");
const _updateworkorderdto = require("./dto/update-work-order.dto");
const _transitionstatusdto = require("./dto/transition-status.dto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let WorkOrdersController = class WorkOrdersController {
    create(companyId, dto) {
        return this.workOrdersService.create(companyId, dto);
    }
    findAll(companyId, status) {
        return this.workOrdersService.findAll(companyId, status);
    }
    findOne(companyId, id) {
        return this.workOrdersService.findOne(companyId, id);
    }
    update(companyId, id, dto) {
        return this.workOrdersService.update(companyId, id, dto);
    }
    transitionStatus(companyId, id, dto) {
        return this.workOrdersService.transitionStatus(companyId, id, dto.status, dto.note);
    }
    assignTechnician(companyId, id, technicianId) {
        return this.workOrdersService.assignTechnician(companyId, id, technicianId);
    }
    autoAssign(companyId, id) {
        return this.workOrdersService.autoAssign(companyId, id);
    }
    delete(companyId, id) {
        return this.workOrdersService.delete(companyId, id);
    }
    constructor(workOrdersService){
        this.workOrdersService = workOrdersService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _createworkorderdto.CreateWorkOrderDto === "undefined" ? Object : _createworkorderdto.CreateWorkOrderDto
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_param(1, (0, _common.Query)('status')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _client.WorkOrderStatus === "undefined" ? Object : _client.WorkOrderStatus
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_param(2, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        typeof _updateworkorderdto.UpdateWorkOrderDto === "undefined" ? Object : _updateworkorderdto.UpdateWorkOrderDto
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "update", null);
_ts_decorate([
    (0, _common.Patch)(':id/status'),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_param(2, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        typeof _transitionstatusdto.TransitionStatusDto === "undefined" ? Object : _transitionstatusdto.TransitionStatusDto
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "transitionStatus", null);
_ts_decorate([
    (0, _common.Patch)(':id/assign/:technicianId'),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_param(2, (0, _common.Param)('technicianId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "assignTechnician", null);
_ts_decorate([
    (0, _common.Post)(':id/auto-assign'),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "autoAssign", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "delete", null);
WorkOrdersController = _ts_decorate([
    (0, _common.Controller)('work-orders'),
    (0, _common.UseGuards)(_companycontextguard.CompanyContextGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _workordersservice.WorkOrdersService === "undefined" ? Object : _workordersservice.WorkOrdersService
    ])
], WorkOrdersController);

//# sourceMappingURL=work-orders.controller.js.map
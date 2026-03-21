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
exports.TechnicianController = void 0;
const common_1 = require("@nestjs/common");
const technician_service_js_1 = require("./technician.service.js");
const create_technician_dto_js_1 = require("./dto/create-technician.dto.js");
const update_technician_dto_js_1 = require("./dto/update-technician.dto.js");
const update_position_dto_js_1 = require("./dto/update-position.dto.js");
let TechnicianController = class TechnicianController {
    technicianService;
    constructor(technicianService) {
        this.technicianService = technicianService;
    }
    create(dto) {
        return this.technicianService.create(dto);
    }
    findAll(req) {
        const companyId = req.companyId;
        return this.technicianService.findAllByCompany(companyId);
    }
    findOne(id, req) {
        const companyId = req.companyId;
        return this.technicianService.findOne(id, companyId);
    }
    update(id, dto, req) {
        const companyId = req.companyId;
        return this.technicianService.update(id, companyId, dto);
    }
    updatePosition(id, dto, req) {
        const companyId = req.companyId;
        return this.technicianService.updatePosition(id, companyId, dto.lat, dto.lng);
    }
    remove(id, req) {
        const companyId = req.companyId;
        return this.technicianService.remove(id, companyId);
    }
};
exports.TechnicianController = TechnicianController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_technician_dto_js_1.CreateTechnicianDto]),
    __metadata("design:returntype", void 0)
], TechnicianController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TechnicianController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TechnicianController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_technician_dto_js_1.UpdateTechnicianDto, Object]),
    __metadata("design:returntype", void 0)
], TechnicianController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/position'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_position_dto_js_1.UpdatePositionDto, Object]),
    __metadata("design:returntype", void 0)
], TechnicianController.prototype, "updatePosition", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TechnicianController.prototype, "remove", null);
exports.TechnicianController = TechnicianController = __decorate([
    (0, common_1.Controller)('technicians'),
    __metadata("design:paramtypes", [technician_service_js_1.TechnicianService])
], TechnicianController);
//# sourceMappingURL=technician.controller.js.map
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
exports.TransitionWorkOrderDto = void 0;
const class_validator_1 = require("class-validator");
class TransitionWorkOrderDto {
    status;
    technicianId;
    note;
}
exports.TransitionWorkOrderDto = TransitionWorkOrderDto;
__decorate([
    (0, class_validator_1.IsEnum)([
        'UNASSIGNED',
        'ASSIGNED',
        'EN_ROUTE',
        'ON_SITE',
        'IN_PROGRESS',
        'COMPLETED',
        'INVOICED',
        'PAID',
    ]),
    __metadata("design:type", String)
], TransitionWorkOrderDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], TransitionWorkOrderDto.prototype, "technicianId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransitionWorkOrderDto.prototype, "note", void 0);
//# sourceMappingURL=transition-work-order.dto.js.map
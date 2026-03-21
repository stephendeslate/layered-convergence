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
exports.CreateWidgetDto = exports.WidgetType = void 0;
const class_validator_1 = require("class-validator");
var WidgetType;
(function (WidgetType) {
    WidgetType["LINE_CHART"] = "LINE_CHART";
    WidgetType["BAR_CHART"] = "BAR_CHART";
    WidgetType["PIE_CHART"] = "PIE_CHART";
    WidgetType["AREA_CHART"] = "AREA_CHART";
    WidgetType["KPI_CARD"] = "KPI_CARD";
    WidgetType["TABLE"] = "TABLE";
    WidgetType["FUNNEL"] = "FUNNEL";
})(WidgetType || (exports.WidgetType = WidgetType = {}));
class CreateWidgetDto {
    dashboardId;
    type;
    config;
    positionX;
    positionY;
    width;
    height;
}
exports.CreateWidgetDto = CreateWidgetDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWidgetDto.prototype, "dashboardId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(WidgetType),
    __metadata("design:type", String)
], CreateWidgetDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateWidgetDto.prototype, "config", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateWidgetDto.prototype, "positionX", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateWidgetDto.prototype, "positionY", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateWidgetDto.prototype, "width", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateWidgetDto.prototype, "height", void 0);
//# sourceMappingURL=create-widget.dto.js.map
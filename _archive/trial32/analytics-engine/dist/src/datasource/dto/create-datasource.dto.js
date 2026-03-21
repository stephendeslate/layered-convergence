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
exports.CreateDataSourceConfigDto = exports.CreateDataSourceDto = exports.DataSourceType = void 0;
const class_validator_1 = require("class-validator");
var DataSourceType;
(function (DataSourceType) {
    DataSourceType["POSTGRESQL"] = "POSTGRESQL";
    DataSourceType["API"] = "API";
    DataSourceType["CSV"] = "CSV";
    DataSourceType["WEBHOOK"] = "WEBHOOK";
})(DataSourceType || (exports.DataSourceType = DataSourceType = {}));
class CreateDataSourceDto {
    name;
    type;
}
exports.CreateDataSourceDto = CreateDataSourceDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDataSourceDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(DataSourceType),
    __metadata("design:type", String)
], CreateDataSourceDto.prototype, "type", void 0);
class CreateDataSourceConfigDto {
    connectionConfig;
    fieldMapping;
    transformSteps;
    syncSchedule;
}
exports.CreateDataSourceConfigDto = CreateDataSourceConfigDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateDataSourceConfigDto.prototype, "connectionConfig", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateDataSourceConfigDto.prototype, "fieldMapping", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateDataSourceConfigDto.prototype, "transformSteps", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDataSourceConfigDto.prototype, "syncSchedule", void 0);
//# sourceMappingURL=create-datasource.dto.js.map
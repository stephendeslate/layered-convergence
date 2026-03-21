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
exports.TransitionTransactionDto = exports.TransactionStatus = void 0;
const class_validator_1 = require("class-validator");
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["FUNDED"] = "FUNDED";
    TransactionStatus["DELIVERED"] = "DELIVERED";
    TransactionStatus["RELEASED"] = "RELEASED";
    TransactionStatus["DISPUTED"] = "DISPUTED";
    TransactionStatus["REFUNDED"] = "REFUNDED";
    TransactionStatus["EXPIRED"] = "EXPIRED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
class TransitionTransactionDto {
    status;
}
exports.TransitionTransactionDto = TransitionTransactionDto;
__decorate([
    (0, class_validator_1.IsEnum)(TransactionStatus),
    __metadata("design:type", String)
], TransitionTransactionDto.prototype, "status", void 0);
//# sourceMappingURL=transition-transaction.dto.js.map
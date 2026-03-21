"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionStateMachine = exports.VALID_TRANSITIONS = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
exports.VALID_TRANSITIONS = new Map([
    [client_1.TransactionStatus.CREATED, [client_1.TransactionStatus.HELD, client_1.TransactionStatus.EXPIRED]],
    [client_1.TransactionStatus.HELD, [client_1.TransactionStatus.RELEASED, client_1.TransactionStatus.DISPUTED, client_1.TransactionStatus.REFUNDED, client_1.TransactionStatus.EXPIRED]],
    [client_1.TransactionStatus.DISPUTED, [client_1.TransactionStatus.RELEASED, client_1.TransactionStatus.REFUNDED]],
    [client_1.TransactionStatus.RELEASED, []],
    [client_1.TransactionStatus.REFUNDED, []],
    [client_1.TransactionStatus.EXPIRED, []],
]);
let TransactionStateMachine = class TransactionStateMachine {
    validateTransition(from, to) {
        const allowed = exports.VALID_TRANSITIONS.get(from);
        if (!allowed || !allowed.includes(to)) {
            throw new common_1.BadRequestException(`Invalid state transition from ${from} to ${to}`);
        }
    }
    canTransition(from, to) {
        const allowed = exports.VALID_TRANSITIONS.get(from);
        return !!allowed && allowed.includes(to);
    }
    getValidTransitions(from) {
        return exports.VALID_TRANSITIONS.get(from) || [];
    }
};
exports.TransactionStateMachine = TransactionStateMachine;
exports.TransactionStateMachine = TransactionStateMachine = __decorate([
    (0, common_1.Injectable)()
], TransactionStateMachine);
//# sourceMappingURL=transaction-state-machine.js.map
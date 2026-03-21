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
var EscrowTimerProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscrowTimerProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const transaction_state_machine_1 = require("./transaction-state-machine");
const client_1 = require("@prisma/client");
let EscrowTimerProcessor = EscrowTimerProcessor_1 = class EscrowTimerProcessor extends bullmq_1.WorkerHost {
    prisma;
    stateMachine;
    logger = new common_1.Logger(EscrowTimerProcessor_1.name);
    constructor(prisma, stateMachine) {
        super();
        this.prisma = prisma;
        this.stateMachine = stateMachine;
    }
    async process(job) {
        const { transactionId } = job.data;
        this.logger.log(`Processing auto-release for transaction ${transactionId}`);
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: transactionId },
        });
        if (!transaction) {
            this.logger.warn(`Transaction ${transactionId} not found`);
            return;
        }
        if (transaction.status !== client_1.TransactionStatus.HELD) {
            this.logger.log(`Transaction ${transactionId} is no longer HELD (status: ${transaction.status}), skipping`);
            return;
        }
        if (this.stateMachine.canTransition(transaction.status, client_1.TransactionStatus.RELEASED)) {
            await this.prisma.transaction.update({
                where: { id: transactionId },
                data: { status: client_1.TransactionStatus.RELEASED },
            });
            await this.prisma.transactionStateHistory.create({
                data: {
                    transactionId,
                    fromState: client_1.TransactionStatus.HELD,
                    toState: client_1.TransactionStatus.RELEASED,
                    reason: 'Auto-released after hold period expired',
                    changedBy: 'system',
                },
            });
            this.logger.log(`Transaction ${transactionId} auto-released`);
        }
    }
};
exports.EscrowTimerProcessor = EscrowTimerProcessor;
exports.EscrowTimerProcessor = EscrowTimerProcessor = EscrowTimerProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('escrow-timer'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        transaction_state_machine_1.TransactionStateMachine])
], EscrowTimerProcessor);
//# sourceMappingURL=escrow-timer.processor.js.map
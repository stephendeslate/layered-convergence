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
exports.TransactionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const transition_transaction_dto_1 = require("./dto/transition-transaction.dto");
const VALID_TRANSITIONS = {
    PENDING: ['FUNDED', 'EXPIRED'],
    FUNDED: ['DELIVERED', 'DISPUTED'],
    DELIVERED: ['RELEASED', 'DISPUTED'],
    RELEASED: [],
    DISPUTED: ['REFUNDED', 'RELEASED'],
    REFUNDED: [],
    EXPIRED: [],
};
let TransactionService = class TransactionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(buyerId, dto) {
        return this.prisma.transaction.create({
            data: {
                amount: dto.amount,
                buyerId,
                providerId: dto.providerId,
                status: transition_transaction_dto_1.TransactionStatus.PENDING,
            },
            include: { buyer: true, provider: true },
        });
    }
    async findAll() {
        return this.prisma.transaction.findMany({
            include: { buyer: true, provider: true, stateHistory: true },
        });
    }
    async findOne(id) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id },
            include: { buyer: true, provider: true, stateHistory: true },
        });
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction ${id} not found`);
        }
        return transaction;
    }
    async findByUser(userId) {
        return this.prisma.transaction.findMany({
            where: {
                OR: [{ buyerId: userId }, { providerId: userId }],
            },
            include: { buyer: true, provider: true, stateHistory: true },
        });
    }
    async transition(id, newStatus) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id },
        });
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction ${id} not found`);
        }
        const currentStatus = transaction.status;
        const allowed = VALID_TRANSITIONS[currentStatus] ?? [];
        if (!allowed.includes(newStatus)) {
            throw new common_1.BadRequestException(`Invalid transition from ${currentStatus} to ${newStatus}`);
        }
        const [updated] = await this.prisma.$transaction([
            this.prisma.transaction.update({
                where: { id },
                data: { status: newStatus },
                include: { buyer: true, provider: true, stateHistory: true },
            }),
            this.prisma.transactionStateHistory.create({
                data: {
                    transactionId: id,
                    fromStatus: currentStatus,
                    toStatus: newStatus,
                },
            }),
        ]);
        return updated;
    }
    getValidTransitions() {
        return VALID_TRANSITIONS;
    }
};
exports.TransactionService = TransactionService;
exports.TransactionService = TransactionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionService);
//# sourceMappingURL=transaction.service.js.map
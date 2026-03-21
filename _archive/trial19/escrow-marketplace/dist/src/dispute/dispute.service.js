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
exports.DisputeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const transaction_service_1 = require("../transaction/transaction.service");
const resolve_dispute_dto_1 = require("./dto/resolve-dispute.dto");
const transition_transaction_dto_1 = require("../transaction/dto/transition-transaction.dto");
let DisputeService = class DisputeService {
    prisma;
    transactionService;
    constructor(prisma, transactionService) {
        this.prisma = prisma;
        this.transactionService = transactionService;
    }
    async create(userId, dto) {
        await this.transactionService.transition(dto.transactionId, transition_transaction_dto_1.TransactionStatus.DISPUTED);
        return this.prisma.dispute.create({
            data: {
                transactionId: dto.transactionId,
                userId,
                reason: dto.reason,
            },
            include: { transaction: true, user: true },
        });
    }
    async findAll() {
        return this.prisma.dispute.findMany({
            include: { transaction: true, user: true },
        });
    }
    async findOne(id) {
        const dispute = await this.prisma.dispute.findUnique({
            where: { id },
            include: { transaction: true, user: true },
        });
        if (!dispute) {
            throw new common_1.NotFoundException(`Dispute ${id} not found`);
        }
        return dispute;
    }
    async resolve(id, resolution) {
        const dispute = await this.findOne(id);
        const newStatus = resolution === resolve_dispute_dto_1.DisputeResolution.REFUNDED
            ? transition_transaction_dto_1.TransactionStatus.REFUNDED
            : transition_transaction_dto_1.TransactionStatus.RELEASED;
        await this.transactionService.transition(dispute.transactionId, newStatus);
        return this.prisma.dispute.update({
            where: { id },
            data: { resolved: true },
            include: { transaction: true, user: true },
        });
    }
};
exports.DisputeService = DisputeService;
exports.DisputeService = DisputeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        transaction_service_1.TransactionService])
], DisputeService);
//# sourceMappingURL=dispute.service.js.map
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
var WebhooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let WebhooksService = WebhooksService_1 = class WebhooksService {
    prisma;
    logger = new common_1.Logger(WebhooksService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async processEvent(event) {
        const existing = await this.prisma.webhookLog.findUnique({
            where: { idempotencyKey: event.id },
        });
        if (existing) {
            this.logger.log(`Duplicate webhook event: ${event.id}`);
            return { processed: false, message: 'Event already processed' };
        }
        try {
            await this.prisma.webhookLog.create({
                data: {
                    eventType: event.type,
                    payload: event.data,
                    idempotencyKey: event.id,
                    processedAt: new Date(),
                },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new common_1.ConflictException('Duplicate webhook event');
            }
            throw error;
        }
        await this.handleEvent(event);
        return { processed: true, message: `Processed ${event.type}` };
    }
    async handleEvent(event) {
        switch (event.type) {
            case 'payment_intent.succeeded':
                this.logger.log(`Payment intent succeeded: ${event.data.id}`);
                break;
            case 'transfer.created':
                this.logger.log(`Transfer created: ${event.data.id}`);
                break;
            case 'payout.paid':
                this.logger.log(`Payout paid: ${event.data.id}`);
                break;
            case 'charge.dispute.created':
                this.logger.log(`Dispute created: ${event.data.id}`);
                break;
            case 'charge.dispute.closed':
                this.logger.log(`Dispute closed: ${event.data.id}`);
                break;
            default:
                this.logger.log(`Unhandled event type: ${event.type}`);
        }
    }
    async findAll(limit = 50) {
        return this.prisma.webhookLog.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByEventType(eventType) {
        return this.prisma.webhookLog.findMany({
            where: { eventType },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = WebhooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map
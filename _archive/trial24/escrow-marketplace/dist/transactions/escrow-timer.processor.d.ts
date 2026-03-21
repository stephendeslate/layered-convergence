import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStateMachine } from './transaction-state-machine';
export declare class EscrowTimerProcessor extends WorkerHost {
    private readonly prisma;
    private readonly stateMachine;
    private readonly logger;
    constructor(prisma: PrismaService, stateMachine: TransactionStateMachine);
    process(job: Job<{
        transactionId: string;
        tenantId: string;
    }>): Promise<void>;
}

import { IsEnum } from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class TransitionDto {
  @IsEnum(TransactionStatus)
  action!: TransactionStatus;
}

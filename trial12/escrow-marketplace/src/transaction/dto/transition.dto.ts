import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TransactionStatus } from '../../../generated/prisma/enums.js';

export class TransitionDto {
  @IsEnum(TransactionStatus)
  toState!: TransactionStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

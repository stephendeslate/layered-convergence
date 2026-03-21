import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class ResolveDisputeDto {
  @IsString()
  @IsNotEmpty()
  resolution!: string;

  @IsEnum(TransactionStatus)
  @IsNotEmpty()
  outcome!: TransactionStatus;
}

// TRACED: EM-API-007 — Transaction status update DTO
import { IsIn, IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateTransactionStatusDto {
  @IsString()
  @MaxLength(20)
  @IsIn(['PENDING', 'COMPLETED', 'DISPUTED', 'REFUNDED', 'FAILED'])
  status!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  disputeReason?: string;
}

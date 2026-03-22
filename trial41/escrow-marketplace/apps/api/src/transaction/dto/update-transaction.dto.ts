import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(['PENDING', 'IN_ESCROW', 'COMPLETED', 'CANCELLED', 'DISPUTED'])
  status?: string;
}

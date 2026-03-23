// TRACED: EM-TDTO-001
import {
  IsString,
  MaxLength,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
  IsInt,
} from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  @MaxLength(36)
  sellerId!: string;

  @IsString()
  @MaxLength(36)
  listingId!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}

export class UpdateTransactionDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(['PENDING', 'COMPLETED', 'CANCELLED', 'DISPUTED'])
  status?: string;
}

export class TransactionQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}

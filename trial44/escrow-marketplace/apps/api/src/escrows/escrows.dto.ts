// TRACED: EM-EDTO-001
import {
  IsString,
  MaxLength,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
  IsInt,
} from 'class-validator';

export class CreateEscrowDto {
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsNumber()
  @Min(0)
  balance!: number;

  @IsString()
  @MaxLength(36)
  transactionId!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}

export class UpdateEscrowDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(['HELD', 'RELEASED', 'REFUNDED', 'DISPUTED'])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;
}

export class EscrowQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}

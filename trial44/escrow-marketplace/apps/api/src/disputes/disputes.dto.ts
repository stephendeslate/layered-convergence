// TRACED: EM-DDTO-001
import {
  IsString,
  MaxLength,
  IsOptional,
  IsIn,
  Min,
  IsInt,
} from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  @MaxLength(2000)
  reason!: string;

  @IsString()
  @MaxLength(36)
  transactionId!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}

export class UpdateDisputeDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(['OPEN', 'REVIEWING', 'RESOLVED', 'ESCALATED'])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  resolution?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  resolvedById?: string;
}

export class DisputeQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}

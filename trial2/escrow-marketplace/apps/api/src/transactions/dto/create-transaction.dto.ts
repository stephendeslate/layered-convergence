import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  providerId!: string;

  @IsInt()
  @Min(100)
  amount!: number;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  description!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  holdPeriodDays?: number;
}

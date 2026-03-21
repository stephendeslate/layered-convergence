import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @MinLength(1)
  sellerId!: string;
}

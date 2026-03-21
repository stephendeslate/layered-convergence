import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsUUID()
  sellerId!: string;
}

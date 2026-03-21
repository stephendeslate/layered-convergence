import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreatePayoutDto {
  @IsString()
  userId!: string;

  @IsInt()
  @Min(100)
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

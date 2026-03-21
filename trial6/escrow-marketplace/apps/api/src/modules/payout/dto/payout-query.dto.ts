import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PayoutStatus } from '@prisma/client';

export class PayoutQueryDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsEnum(PayoutStatus)
  @IsOptional()
  status?: PayoutStatus;
}

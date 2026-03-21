import { IsOptional, IsEnum, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import {
  TransactionStatus,
  DisputeStatus,
  OnboardingStatus,
  WebhookStatus,
} from '@prisma/client';

class BasePaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class AdminTransactionQueryDto extends BasePaginationDto {
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;
}

export class AdminDisputeQueryDto extends BasePaginationDto {
  @IsOptional()
  @IsEnum(DisputeStatus)
  status?: DisputeStatus;
}

export class AdminProviderQueryDto extends BasePaginationDto {
  @IsOptional()
  @IsEnum(OnboardingStatus)
  onboardingStatus?: OnboardingStatus;
}

export class AdminWebhookQueryDto extends BasePaginationDto {
  @IsOptional()
  @IsEnum(WebhookStatus)
  status?: WebhookStatus;

  @IsOptional()
  @IsString()
  eventType?: string;
}

import { IsObject, IsOptional, IsDateString } from 'class-validator';

export class WebhookPayloadDto {
  @IsObject()
  dimensions: Record<string, unknown>;

  @IsObject()
  metrics: Record<string, number>;

  @IsDateString()
  @IsOptional()
  timestamp?: string;
}

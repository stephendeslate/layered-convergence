import { IsString, IsOptional, IsObject, IsDateString } from 'class-validator';

export class IngestWebhookDto {
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @IsOptional()
  @IsObject()
  dimensions?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  metrics?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  event?: string;
}

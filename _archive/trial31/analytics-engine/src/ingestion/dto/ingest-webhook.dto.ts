import { IsOptional, IsString } from 'class-validator';

export class IngestWebhookDto {
  @IsOptional()
  @IsString()
  timestamp?: string;

  @IsOptional()
  dimensions?: Record<string, unknown>;

  @IsOptional()
  metrics?: Record<string, unknown>;
}

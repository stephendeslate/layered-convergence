import { IsString, IsDateString, IsOptional, IsObject } from 'class-validator';

export class IngestWebhookDto {
  @IsDateString()
  timestamp!: string;

  @IsOptional()
  @IsObject()
  dimensions?: Record<string, string>;

  @IsOptional()
  @IsObject()
  metrics?: Record<string, number>;
}

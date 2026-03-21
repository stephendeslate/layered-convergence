import { IsObject, IsOptional, IsDateString } from 'class-validator';

export class IngestWebhookDto {
  @IsObject()
  payload: Record<string, unknown>;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}

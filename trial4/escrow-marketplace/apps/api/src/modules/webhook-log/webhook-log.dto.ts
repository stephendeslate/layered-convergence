import { IsString, IsOptional, IsObject } from 'class-validator';

export class ProcessWebhookDto {
  @IsString()
  eventType: string;

  @IsObject()
  payload: Record<string, unknown>;

  @IsString()
  idempotencyKey: string;

  @IsOptional()
  @IsString()
  provider?: string;
}

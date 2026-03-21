import { IsString, IsOptional } from 'class-validator';

export class WebhookEventDto {
  @IsString()
  type!: string;

  @IsOptional()
  data?: Record<string, unknown>;

  @IsString()
  idempotencyKey!: string;
}

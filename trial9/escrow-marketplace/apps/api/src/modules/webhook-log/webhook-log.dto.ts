import { IsString, IsObject } from 'class-validator';

export class CreateWebhookLogDto {
  @IsString()
  eventType!: string;

  @IsObject()
  payload!: Record<string, unknown>;

  @IsString()
  idempotencyKey!: string;
}

import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class WebhookEventDto {
  @IsString()
  @IsNotEmpty()
  eventType: string;

  @IsObject()
  payload: Record<string, any>;

  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}

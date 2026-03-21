import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateWebhookDto {
  @IsUUID()
  transactionId!: string;

  @IsString()
  @IsNotEmpty()
  event!: string;

  @IsOptional()
  payload?: Record<string, unknown>;
}

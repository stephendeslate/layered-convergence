import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class WebhookEventDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsObject()
  data!: Record<string, any>;
}

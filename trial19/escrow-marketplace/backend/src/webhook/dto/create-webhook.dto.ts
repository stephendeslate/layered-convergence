import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateWebhookDto {
  @IsUrl()
  url!: string;

  @IsString()
  @IsNotEmpty()
  eventType!: string;

  @IsString()
  @IsNotEmpty()
  secret!: string;
}

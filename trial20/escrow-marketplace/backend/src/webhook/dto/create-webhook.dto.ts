import { IsString, IsUrl } from 'class-validator';

export class CreateWebhookDto {
  @IsUrl()
  url: string;

  @IsString()
  event: string;
}

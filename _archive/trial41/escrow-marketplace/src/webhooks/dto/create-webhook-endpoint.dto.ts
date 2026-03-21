import { IsArray, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateWebhookEndpointDto {
  @IsUrl()
  url: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  events: string[];
}

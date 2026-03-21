import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class WebhookLogQueryDto {
  @IsString()
  @IsOptional()
  eventType?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}

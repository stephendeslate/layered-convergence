import { IsArray, ValidateNested, IsString, IsOptional, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class WebhookEventDto {
  @IsString()
  timestamp: string;

  @IsOptional()
  @IsObject()
  dimensions?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  metrics?: Record<string, unknown>;
}

export class WebhookIngestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WebhookEventDto)
  events: WebhookEventDto[];
}

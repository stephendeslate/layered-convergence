import { IsString, IsObject, IsOptional, IsInt, Min } from 'class-validator';

export class CacheQueryDto {
  @IsString()
  queryHash!: string;

  @IsObject()
  result!: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(1)
  ttlSeconds?: number;
}

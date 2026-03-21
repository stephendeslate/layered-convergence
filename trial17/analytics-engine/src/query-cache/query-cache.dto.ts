import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

export class SetCacheDto {
  @IsString()
  @IsNotEmpty()
  queryHash!: string;

  @IsObject()
  result!: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(1)
  ttl?: number;
}

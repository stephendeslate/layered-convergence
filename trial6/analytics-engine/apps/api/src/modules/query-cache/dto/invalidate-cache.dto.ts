import { IsString, IsOptional } from 'class-validator';

export class InvalidateCacheDto {
  @IsString()
  @IsOptional()
  queryHash?: string;
}

import { IsString, IsIn, IsOptional } from 'class-validator';

export class ResolveDisputeDto {
  @IsIn(['buyer', 'provider'])
  resolution: 'buyer' | 'provider';

  @IsOptional()
  @IsString()
  resolutionNote?: string;
}

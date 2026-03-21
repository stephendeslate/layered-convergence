import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class ResolveDisputeDto {
  @IsEnum(['RESOLVED_BUYER', 'RESOLVED_PROVIDER'])
  resolution: 'RESOLVED_BUYER' | 'RESOLVED_PROVIDER';

  @IsNotEmpty()
  @IsString()
  reason: string;
}

import { IsOptional, IsString } from 'class-validator';

export class DisputeReasonDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

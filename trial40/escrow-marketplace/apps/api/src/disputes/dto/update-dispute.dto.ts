import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';

export class UpdateDisputeDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'])
  status?: string;
}

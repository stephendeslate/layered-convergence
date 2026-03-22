import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export class UpdateDisputeDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  resolution?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(['OPEN', 'REVIEWING', 'RESOLVED', 'ESCALATED', 'CLOSED'])
  status?: string;
}

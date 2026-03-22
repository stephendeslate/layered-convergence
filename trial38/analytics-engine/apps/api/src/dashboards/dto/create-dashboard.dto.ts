// TRACED: AE-API-02
// TRACED: AE-SEC-06
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;
}

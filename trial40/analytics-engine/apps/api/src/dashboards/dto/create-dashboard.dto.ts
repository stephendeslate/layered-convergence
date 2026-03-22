import { IsString, MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsString()
  @MaxLength(36)
  tenantId: string;

  @IsString()
  @MaxLength(36)
  userId: string;
}

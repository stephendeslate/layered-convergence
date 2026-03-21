import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  layout?: any;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

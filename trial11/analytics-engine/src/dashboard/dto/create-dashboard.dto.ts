import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @IsOptional()
  layout?: Record<string, unknown>;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

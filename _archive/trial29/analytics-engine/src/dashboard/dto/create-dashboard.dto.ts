import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  name: string;

  @IsObject()
  layout: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

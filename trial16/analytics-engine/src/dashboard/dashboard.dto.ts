import {
  IsString,
  IsBoolean,
  IsOptional,
  IsObject,
  IsNotEmpty,
} from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  layout?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateDashboardDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  layout?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

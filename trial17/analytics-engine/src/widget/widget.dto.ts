import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsUUID,
  IsIn,
} from 'class-validator';

export class CreateWidgetDto {
  @IsUUID()
  dashboardId!: string;

  @IsString()
  @IsIn(['LINE', 'BAR', 'PIE', 'METRIC', 'TABLE'])
  type!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsObject()
  config!: Record<string, unknown>;

  @IsObject()
  position!: Record<string, unknown>;
}

export class UpdateWidgetDto {
  @IsOptional()
  @IsString()
  @IsIn(['LINE', 'BAR', 'PIE', 'METRIC', 'TABLE'])
  type?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  position?: Record<string, unknown>;
}

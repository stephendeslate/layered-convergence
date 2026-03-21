import {
  IsString,
  IsObject,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  IsIn,
} from 'class-validator';

export class CreateWidgetDto {
  @IsUUID()
  dashboardId!: string;

  @IsString()
  @IsIn(['line', 'bar', 'pie', 'metric', 'table'])
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
  @IsIn(['line', 'bar', 'pie', 'metric', 'table'])
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

import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsObject,
  IsEnum,
  IsNumber,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GroupByPeriod, FilterOperator } from '@analytics-engine/shared';

export class DateRangeDto {
  @IsString()
  @IsNotEmpty()
  start!: string;

  @IsString()
  @IsNotEmpty()
  end!: string;
}

export class QueryFilterDto {
  @IsString()
  @IsNotEmpty()
  field!: string;

  @IsEnum(FilterOperator)
  operator!: FilterOperator;

  @IsNotEmpty()
  value!: string | number | boolean;
}

export class QueryDto {
  @IsString()
  @IsNotEmpty()
  dataSourceId!: string;

  @IsArray()
  @IsString({ each: true })
  metrics!: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dimensions?: string[];

  @ValidateNested()
  @Type(() => DateRangeDto)
  @IsOptional()
  dateRange?: DateRangeDto;

  @IsEnum(GroupByPeriod)
  @IsOptional()
  groupBy?: GroupByPeriod;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QueryFilterDto)
  @IsOptional()
  filters?: QueryFilterDto[];

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10000)
  limit?: number;
}

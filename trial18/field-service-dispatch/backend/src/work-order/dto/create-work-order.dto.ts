import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min, Max } from 'class-validator';

export class CreateWorkOrderDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  priority?: number;

  @IsUUID()
  customerId!: string;

  @IsUUID()
  @IsOptional()
  technicianId?: string;
}

import { IsUUID, IsString, IsOptional, IsInt, IsNumber, Min } from 'class-validator';

export class CreatePartDto {
  @IsUUID()
  workOrderId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  partNumber?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @IsOptional()
  unitCost?: number;
}

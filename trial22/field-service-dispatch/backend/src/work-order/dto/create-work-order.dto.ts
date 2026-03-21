import { IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateWorkOrderDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority!: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  @IsString()
  @IsOptional()
  scheduledDate?: string;

  @IsUUID()
  customerId!: string;
}

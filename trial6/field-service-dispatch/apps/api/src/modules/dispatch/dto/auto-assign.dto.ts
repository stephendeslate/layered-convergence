import { IsString, IsNotEmpty } from 'class-validator';

export class AutoAssignDto {
  @IsString()
  @IsNotEmpty()
  workOrderId: string;
}

export class DispatchQueryDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;
}

import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateAssignmentDto {
  @IsUUID()
  workOrderId: string;

  @IsUUID()
  technicianId: string;

  @IsString()
  @IsOptional()
  note?: string;
}

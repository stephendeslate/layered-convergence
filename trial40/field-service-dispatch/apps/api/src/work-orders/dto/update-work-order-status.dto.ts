// TRACED: FD-WO-005 — Update work order status DTO with enum validation
import { IsString, IsEnum, MaxLength } from 'class-validator';

export class UpdateWorkOrderStatusDto {
  @IsString()
  @MaxLength(20)
  @IsEnum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED'])
  status!: string;
}

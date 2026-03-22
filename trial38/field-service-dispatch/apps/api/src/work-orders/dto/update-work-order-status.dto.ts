// TRACED: FD-WO-006 — Update work order status DTO
import { IsString, MaxLength } from 'class-validator';

export class UpdateWorkOrderStatusDto {
  @IsString()
  @MaxLength(50)
  status: string;
}

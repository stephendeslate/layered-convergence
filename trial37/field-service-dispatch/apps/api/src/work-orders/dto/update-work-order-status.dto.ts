// TRACED: FD-WO-005 — Update work order status DTO with @MaxLength
import { IsString, MaxLength } from 'class-validator';

export class UpdateWorkOrderStatusDto {
  @IsString()
  @MaxLength(50)
  status: string;
}

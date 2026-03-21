import { IsIn } from 'class-validator';

export class TransitionWorkOrderDto {
  @IsIn(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'INVOICED', 'CLOSED', 'CANCELLED'])
  status!: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'INVOICED' | 'CLOSED' | 'CANCELLED';
}

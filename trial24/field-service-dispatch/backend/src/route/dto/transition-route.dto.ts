import { IsIn } from 'class-validator';

export class TransitionRouteDto {
  @IsIn(['PLANNED', 'IN_PROGRESS', 'COMPLETED'])
  status!: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
}

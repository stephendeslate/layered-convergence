import { IsString, IsIn, IsOptional } from 'class-validator';

export class TransitionWorkOrderDto {
  @IsIn(['assigned', 'en_route', 'on_site', 'in_progress', 'completed', 'invoiced', 'paid'])
  status!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  technicianId?: string;
}

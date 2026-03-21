import { IsString, IsNotEmpty } from 'class-validator';

export class AssignWorkOrderDto {
  @IsString()
  @IsNotEmpty()
  technicianId!: string;
}

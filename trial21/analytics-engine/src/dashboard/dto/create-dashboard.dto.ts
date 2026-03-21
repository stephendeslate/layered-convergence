import { IsString } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  name!: string;
}

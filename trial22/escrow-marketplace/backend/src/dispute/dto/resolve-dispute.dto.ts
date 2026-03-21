import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class ResolveDisputeDto {
  @IsString()
  @IsNotEmpty()
  resolution!: string;

  @IsIn(['REFUNDED', 'DISMISSED'])
  outcome!: string;
}

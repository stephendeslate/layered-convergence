import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

export enum ResolutionTarget {
  BUYER = 'BUYER',
  PROVIDER = 'PROVIDER',
}

export class ResolveDisputeDto {
  @IsEnum(ResolutionTarget)
  resolution!: ResolutionTarget;

  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  notes!: string;
}

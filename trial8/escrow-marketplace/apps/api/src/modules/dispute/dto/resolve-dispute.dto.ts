import { IsString, IsIn } from 'class-validator';

export class ResolveDisputeDto {
  @IsIn(['resolved_buyer', 'resolved_provider', 'escalated'])
  resolution!: string;

  @IsString()
  reason!: string;
}

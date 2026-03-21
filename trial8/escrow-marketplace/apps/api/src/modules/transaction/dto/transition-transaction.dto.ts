import { IsString, IsIn, IsOptional } from 'class-validator';

export class TransitionTransactionDto {
  @IsIn(['held', 'released', 'disputed', 'refunded', 'expired'])
  action!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

import { IsString, MaxLength, IsNumber, Min, IsOptional, IsIn } from 'class-validator';

export class UpdateEscrowDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  balance?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(['HOLDING', 'RELEASED', 'REFUNDED', 'DISPUTED'])
  status?: string;
}

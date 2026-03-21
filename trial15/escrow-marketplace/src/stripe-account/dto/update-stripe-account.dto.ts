import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateStripeAccountDto {
  @IsBoolean()
  @IsOptional()
  chargesEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  payoutsEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  detailsSubmitted?: boolean;
}

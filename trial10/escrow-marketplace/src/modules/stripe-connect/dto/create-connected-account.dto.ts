import { IsString } from 'class-validator';

export class CreateConnectedAccountDto {
  @IsString()
  userId!: string;
}

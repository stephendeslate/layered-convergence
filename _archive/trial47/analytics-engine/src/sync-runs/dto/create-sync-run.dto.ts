import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSyncRunDto {
  @IsString()
  @IsNotEmpty()
  dataSourceId!: string;
}

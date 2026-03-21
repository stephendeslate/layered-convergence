import { IsString } from 'class-validator';

export class CreateSyncRunDto {
  @IsString()
  dataSourceId: string;
}

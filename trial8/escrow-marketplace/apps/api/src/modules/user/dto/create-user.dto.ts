import { IsString, IsEmail, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  name!: string;

  @IsIn(['buyer', 'provider', 'admin'])
  role!: string;
}

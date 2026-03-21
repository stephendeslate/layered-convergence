import { IsString, IsEmail, IsIn, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @IsIn(['buyer', 'provider', 'admin'])
  role!: string;
}

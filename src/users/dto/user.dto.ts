import { OmitType, PartialType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { User } from '../schemas/user.schema';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

class UpdateUser extends OmitType(CreateUserDto, ['password'] as const) {}

export class UpdateUserDto extends PartialType(UpdateUser) {}

export class UserPayload extends PartialType(User) {
  createdA?: string;
  updateAt?: string;
}

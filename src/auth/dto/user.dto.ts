import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'The username of the user',
    required: true,
  })
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({
    description: 'The email of the user',
    required: true,
    example: `email${Math.floor(Math.random() * 1000)}@example.com`,
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    description: 'The password of the user',
    required: true,
    minLength: 8,
    example: `password${Math.floor(Math.random() * 1000)}`,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  readonly password: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'The email of the user',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email' })
  readonly email: string;

  @ApiProperty({
    description: 'The password of the user',
    required: true,
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  readonly password: string;
}

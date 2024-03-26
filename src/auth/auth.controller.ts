import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, SignUpDto, UserPayload } from './dto/user.dto';

const userResponseSchema = {
  type: 'object',
  properties: {
    token: {
      type: 'string',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxMjIwZjQwZjQ',
    },
    username: {
      type: 'string',
      example: 'john_doe',
    },
    userId: {
      type: 'string',
      example: '61220f40f445FDDDQDQDCA3432423',
    },
  },
};
@Controller('local-auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiCreatedResponse({
    description: 'User logged in successfully',
    schema: userResponseSchema,
  })
  login(@Body() loginDto: LoginDto): Promise<UserPayload> {
    return this.authService.loginUser(loginDto);
  }

  @Post('signup')
  @ApiCreatedResponse({
    description: 'User signed up successfully',
    schema: userResponseSchema,
  })
  signUp(@Body() createUserDto: SignUpDto): Promise<UserPayload> {
    return this.authService.signUpUser(createUserDto);
  }

  @Get()
  @ApiCreatedResponse({
    description: 'List of all users',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '61220f40f445FDDDQDQDCA3432423',
          },
          username: {
            type: 'string',
            example: 'john_doe',
          },
          email: {
            type: 'string',
            example: 'john@email.com',
          },
        },
      },
    },
  })
  findAll() {
    return this.authService.fetchAllUsers();
  }
}

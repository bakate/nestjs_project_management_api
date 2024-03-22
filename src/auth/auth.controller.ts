import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignUpDto } from './dto/user.dto';

@Controller('local-auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<{ token: string }> {
    return this.authService.loginUser(loginDto);
  }

  @Post('signup')
  signUp(@Body() createUserDto: SignUpDto): Promise<{ token: string }> {
    return this.authService.signUpUser(createUserDto);
  }

  @Get()
  findAll() {
    return this.authService.fetchAllUsers();
  }
}

import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import mongoose from 'mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto, SignUpDto } from './dto/user.dto';

describe('AuthController', () => {
  let authService: AuthService;
  let controller: AuthController;

  const mockUser = {
    id: new mongoose.Types.ObjectId().toString(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
  };

  const jwtToken = faker.string.uuid();

  const mockAuthService = {
    signUpUser: jest.fn().mockResolvedValueOnce(jwtToken),
    loginUser: jest.fn().mockResolvedValueOnce(jwtToken),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('signUp', () => {
    it('should register a new user', async () => {
      const signUpDto: SignUpDto = {
        username: mockUser.username,
        email: mockUser.email,
        password: faker.internet.password(),
      };

      const result = await controller.signUp(signUpDto);
      expect(result).toEqual({ token: jwtToken });
      expect(authService.signUpUser).toHaveBeenCalledWith(signUpDto);
    });
  });

  describe('login', () => {
    it('should log in a user', async () => {
      const loginDto: LoginDto = {
        email: mockUser.email,
        password: faker.internet.password(),
      };

      const result = await controller.login(loginDto);
      expect(result).toEqual({ token: jwtToken });
      expect(authService.loginUser).toHaveBeenCalledWith(loginDto);
    });
  });
});

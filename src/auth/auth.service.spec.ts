import { faker } from '@faker-js/faker';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import mongoose, { Model } from 'mongoose';
import { AuthService } from './auth.service';
import { LoginDto, SignUpDto } from './dto/user.dto';
import { User } from './schemas/user.schema';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let model: Model<User>;

  const mockUser = {
    id: new mongoose.Types.ObjectId().toString(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
  };

  const token = faker.string.uuid();

  const mockModel = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: getModelToken(User.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signUpUser', () => {
    it('should register a user', async () => {
      const signUpDto: SignUpDto = {
        username: mockUser.username,
        email: mockUser.email,
        password: faker.internet.password(),
      };
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => 'hashedPassword');
      jest
        .spyOn(model, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockUser as any));

      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await authService.signUpUser(signUpDto);

      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        token,
      });
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: mockUser.email,
      password: faker.internet.password(),
    };
    it('should login a user and return the token', async () => {
      // we need to mock select method to return the password
      jest.spyOn(model, 'findOne').mockReturnValue({
        select: jest.fn().mockReturnValue({
          ...mockUser,
          password: 'password',
        }),
      } as any);
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => true);
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await authService.loginUser(loginDto);
      expect(result).toEqual({
        token,
      });
    });

    it('should throw invalid email error', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        select: jest.fn().mockReturnValue(null),
      } as any);

      await expect(authService.loginUser(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw invalid password error', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        select: jest.fn().mockReturnValue({
          ...mockUser,
          password: 'password',
        }),
      } as any);
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => false);

      await expect(authService.loginUser(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

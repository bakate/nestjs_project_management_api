import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { Model } from 'mongoose';
import { LoginDto, SignUpDto } from './dto/user.dto';
import { User } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async verifyUserPassword(username: Pick<User, 'username'>, password: string) {
    const userWithPassword = await this.userModel.findOne({
      username,
    });

    if (!userWithPassword || !userWithPassword.password) {
      throw new UnauthorizedException(
        `User with username:${username} not found `,
      );
    }

    const isValid = await bcrypt.compare(password, userWithPassword.password);

    if (!isValid) {
      throw new UnauthorizedException(`Invalid password`);
    }

    return {
      id: userWithPassword.id,
      email: userWithPassword.email,
      username: userWithPassword.username,
    };
  }

  generateJwt(userId: string): string {
    return sign({ id: userId }, 'JWT_SECRET');
  }

  async getPasswordHash(password: string) {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  async signUpUser(body: SignUpDto): Promise<{ token: string }> {
    // make sure the user does not exist
    const existingUser = await this.userModel.findOne({ email: body.email });
    if (existingUser) {
      throw new HttpException(
        `User with email:${body.email} already exists`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const hashedPassword = await this.getPasswordHash(body.password);

    const user = await this.userModel.create({
      username: body.username,
      email: body.email,
      password: hashedPassword,
    });

    const token = this.generateJwt(user.id);

    return { token };
  }

  async loginUser(loginDto: LoginDto): Promise<{ token: string }> {
    const user = await this.userModel
      .findOne({ email: loginDto.email })
      .select('+password');

    if (!user) {
      throw new HttpException(
        'User not found',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isPasswordCorrect = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new HttpException(
        'Incorrect password',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const token = this.generateJwt(user.id);

    return { token };
  }

  async fetchAllUsers() {
    return await this.userModel.find();
  }
}

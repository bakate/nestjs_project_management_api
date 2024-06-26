import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { LoginDto, SignUpDto, UserPayload } from './dto/user.dto';
import { User } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

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

  async getPasswordHash(password: string) {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  async signUpUser(body: SignUpDto): Promise<UserPayload> {
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

    const token = this.jwtService.sign({ userId: user.id, email: user.email });

    return {
      token,
      userId: user.id,
      username: user.username,
    };
  }

  async loginUser(loginDto: LoginDto): Promise<UserPayload> {
    const user = await this.userModel
      .findOne({ email: loginDto.email })
      .select('+password');

    if (!user) {
      throw new UnauthorizedException(
        `User with email:${loginDto.email} not found `,
      );
    }

    const isPasswordCorrect = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Incorrect password');
    }

    const token = this.jwtService.sign(
      { userId: user.id, email: user.email },
      {},
    );

    return {
      token,
      userId: user.id,
      username: user.username,
    };
  }

  async fetchAllUsers() {
    return await this.userModel.find();
  }
}

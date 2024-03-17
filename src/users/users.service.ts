import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto, UpdateUserDto, UserPayload } from './dto/user.dto';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(body: CreateUserDto): Promise<UserPayload> {
    const createdUser = new this.userModel(body);
    const user = await createdUser.save();
    return user;
  }

  async findUser(id: string): Promise<UserPayload> {
    const user = await this.userModel.findOne({ _id: id }).exec();

    if (!user) {
      throw new NotFoundException(`User with email id:${id} not found `);
    }
    return user;
  }

  async listUser(): Promise<UserPayload[]> {
    const users = await this.userModel.find();
    return users.map((user) => user);
  }

  async updateUser(id: string, body: UpdateUserDto): Promise<UserPayload> {
    await this.userModel.updateOne({ _id: id }, body);
    const updatedUser = this.userModel.findById(id);
    return await updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    await this.userModel.deleteOne({ _id: id });
  }
}

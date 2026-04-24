import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, type UserDocument } from './user.schema';
import type { UserRole } from './user.roles';

type PaginationOptions = {
  page: number;
  limit: number;
};

type UserListResult = {
  data: UserDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<UserDocument> {
    const user = await this.userModel.create(data);
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId).exec();
  }

  async listUsers({ page, limit }: PaginationOptions): Promise<UserListResult> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.userModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUser(
    userId: string,
    data: Partial<{ name: string; email: string; password: string; role: UserRole }>,
  ): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(userId, data, { new: true, runValidators: true }).exec();
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(userId).exec();
    return Boolean(result);
  }
}

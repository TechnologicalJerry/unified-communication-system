import { Injectable } from '@nestjs/common';

import { HttpError } from '../../lib/http-error';
import { hashPassword } from '../../lib/password';
import type { AuthUser } from '../../common/types/auth-user';
import type { CreateUserInput, UpdateUserInput } from './user.schemas';
import { ROLE_HIERARCHY, type UserRole } from './user.roles';
import { UserRepository } from './user.repository';
import type { UserDocument } from './user.schema';

export type UserResponse = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  private toUserResponse(user: UserDocument): UserResponse {
    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private hasRoleAtLeast(currentRole: UserRole, requiredRole: UserRole): boolean {
    return ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[requiredRole];
  }

  private canManageRole(actorRole: UserRole, targetRole: UserRole): boolean {
    if (actorRole === 'admin') {
      return true;
    }

    if (actorRole === 'manager') {
      return targetRole === 'lead' || targetRole === 'user';
    }

    return false;
  }

  async registerUser(input: CreateUserInput): Promise<UserResponse> {
    const existingUser = await this.userRepository.findByEmail(input.email.toLowerCase());

    if (existingUser) {
      throw new HttpError(409, 'Email address is already in use');
    }

    const hashedPassword = await hashPassword(input.password);
    const createdUser = await this.userRepository.createUser({
      ...input,
      email: input.email.toLowerCase(),
      password: hashedPassword,
      role: input.role ?? 'user',
    });

    return this.toUserResponse(createdUser);
  }

  async createUserByAdmin(input: CreateUserInput, actor: AuthUser): Promise<UserResponse> {
    if (!this.hasRoleAtLeast(actor.role, 'manager')) {
      throw new HttpError(403, 'Insufficient permissions to create users');
    }

    const requestedRole = input.role ?? 'user';

    if (!this.canManageRole(actor.role, requestedRole)) {
      throw new HttpError(403, 'You cannot assign this role');
    }

    return this.registerUser({
      ...input,
      role: requestedRole,
    });
  }

  async getUserById(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    return this.toUserResponse(user);
  }

  async getUsers(page: number, limit: number) {
    const result = await this.userRepository.listUsers({ page, limit });

    return {
      ...result,
      data: result.data.map((user) => this.toUserResponse(user)),
    };
  }

  async patchUser(userId: string, actor: AuthUser, input: UpdateUserInput): Promise<UserResponse> {
    const targetUser = await this.userRepository.findById(userId);

    if (!targetUser) {
      throw new HttpError(404, 'User not found');
    }

    const isSelf = actor.sub === userId;
    const isPrivileged = this.hasRoleAtLeast(actor.role, 'manager');

    if (!isSelf && !isPrivileged) {
      throw new HttpError(403, 'You can only update your own account');
    }

    if (!isSelf && isPrivileged && !this.canManageRole(actor.role, targetUser.role)) {
      throw new HttpError(403, 'You cannot update this user');
    }

    const payload: Partial<{ name: string; email: string; password: string; role: UserRole }> = {
      ...input,
    };

    if (input.role) {
      if (!isPrivileged) {
        throw new HttpError(403, 'You are not allowed to change roles');
      }

      if (!this.canManageRole(actor.role, input.role)) {
        throw new HttpError(403, 'You cannot assign this role');
      }

      payload.role = input.role;
    }

    if (input.email) {
      const normalizedEmail = input.email.toLowerCase();
      const userWithEmail = await this.userRepository.findByEmail(normalizedEmail);

      if (userWithEmail && String(userWithEmail._id) !== userId) {
        throw new HttpError(409, 'Email address is already in use');
      }

      payload.email = normalizedEmail;
    }

    if (input.password) {
      payload.password = await hashPassword(input.password);
    }

    const updatedUser = await this.userRepository.updateUser(userId, payload);

    if (!updatedUser) {
      throw new HttpError(404, 'User not found');
    }

    return this.toUserResponse(updatedUser);
  }

  async removeUser(userId: string, actor: AuthUser): Promise<void> {
    const targetUser = await this.userRepository.findById(userId);

    if (!targetUser) {
      throw new HttpError(404, 'User not found');
    }

    const isSelf = actor.sub === userId;

    if (isSelf) {
      const deleted = await this.userRepository.deleteUser(userId);
      if (!deleted) {
        throw new HttpError(404, 'User not found');
      }
      return;
    }

    if (!this.hasRoleAtLeast(actor.role, 'manager')) {
      throw new HttpError(403, 'You can only delete your own account');
    }

    if (!this.canManageRole(actor.role, targetUser.role)) {
      throw new HttpError(403, 'You cannot delete this user');
    }

    const deleted = await this.userRepository.deleteUser(userId);

    if (!deleted) {
      throw new HttpError(404, 'User not found');
    }
  }
}

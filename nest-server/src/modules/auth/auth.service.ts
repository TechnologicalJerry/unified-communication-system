import crypto from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { HttpError } from '../../lib/http-error';
import { signAccessToken } from '../../lib/jwt';
import { hashPassword, verifyPassword } from '../../lib/password';
import { UserService } from '../users/user.service';
import { UserRepository } from '../users/user.repository';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from './auth.schemas';
import { PasswordResetToken } from './password-reset-token.schema';

function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    @InjectModel(PasswordResetToken.name)
    private readonly passwordResetTokenModel: Model<PasswordResetToken>,
  ) {}

  async register(input: RegisterInput) {
    const user = await this.userService.registerUser(input);

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      accessToken,
    };
  }

  async login(input: LoginInput) {
    const user = await this.userRepository.findByEmail(input.email.toLowerCase());

    if (!user) {
      throw new HttpError(401, 'Invalid email or password');
    }

    const passwordMatches = await verifyPassword(input.password, user.password);

    if (!passwordMatches) {
      throw new HttpError(401, 'Invalid email or password');
    }

    const userResponse = await this.userService.getUserById(String(user._id));

    const accessToken = signAccessToken({
      sub: userResponse.id,
      email: userResponse.email,
      role: userResponse.role,
    });

    return {
      user: userResponse,
      accessToken,
    };
  }

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await this.userRepository.findByEmail(input.email.toLowerCase());

    if (!user) {
      return {
        message: 'If the account exists, a password reset link has been sent.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(resetToken);
    const expiresAt = new Date(Date.now() + env.RESET_PASSWORD_TOKEN_TTL_MINUTES * 60 * 1000);

    await this.passwordResetTokenModel.deleteMany({ userId: user._id, usedAt: null });

    await this.passwordResetTokenModel.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    logger.info('Password reset requested', {
      userId: String(user._id),
      email: user.email,
      expiresAt: expiresAt.toISOString(),
    });

    if (env.NODE_ENV !== 'production') {
      return {
        message: 'If the account exists, a password reset link has been sent.',
        resetToken,
      };
    }

    return {
      message: 'If the account exists, a password reset link has been sent.',
    };
  }

  async resetPassword(input: ResetPasswordInput) {
    const tokenHash = hashResetToken(input.token);
    const tokenRecord = await this.passwordResetTokenModel
      .findOne({
        tokenHash,
        usedAt: null,
        expiresAt: { $gt: new Date() },
      })
      .exec();

    if (!tokenRecord) {
      throw new HttpError(400, 'Invalid or expired reset token');
    }

    const user = await this.userRepository.findById(String(tokenRecord.userId));

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    const hashedPassword = await hashPassword(input.newPassword);

    await this.userRepository.updateUser(String(user._id), {
      password: hashedPassword,
    });

    tokenRecord.usedAt = new Date();
    await tokenRecord.save();

    await this.passwordResetTokenModel.deleteMany({ userId: user._id, usedAt: null });

    return {
      message: 'Password has been reset successfully.',
    };
  }
}

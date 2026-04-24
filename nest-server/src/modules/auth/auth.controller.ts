import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../../common/guards/auth.guard';
import type { AuthUser } from '../../common/types/auth-user';
import { HttpError } from '../../lib/http-error';
import { UserService } from '../users/user.service';
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from './auth.schemas';
import { AuthService } from './auth.service';

type RequestWithUser = {
  user?: AuthUser;
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async register(@Body() body: unknown) {
    const payload = registerSchema.parse(body);
    const result = await this.authService.register(payload);

    return { data: result };
  }

  @Post('login')
  async login(@Body() body: unknown) {
    const payload = loginSchema.parse(body);
    const result = await this.authService.login(payload);

    return { data: result };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: unknown) {
    const payload = forgotPasswordSchema.parse(body);
    const result = await this.authService.forgotPassword(payload);

    return { data: result };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: unknown) {
    const payload = resetPasswordSchema.parse(body);
    const result = await this.authService.resetPassword(payload);

    return { data: result };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: RequestWithUser) {
    const actor = req.user;

    if (!actor) {
      throw new HttpError(401, 'Authorization token is missing or malformed');
    }

    const user = await this.userService.getUserById(actor.sub);

    return { data: user };
  }
}

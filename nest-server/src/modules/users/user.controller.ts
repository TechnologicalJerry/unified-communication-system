import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '../../common/decorators/roles.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthUser } from '../../common/types/auth-user';
import { HttpError } from '../../lib/http-error';
import { createUserSchema, objectIdSchema, paginationSchema, updateUserSchema } from './user.schemas';
import { UserService } from './user.service';

type RequestWithUser = {
  user?: AuthUser;
};

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async createUser(@Body() body: unknown, @Req() req: RequestWithUser) {
    const payload = createUserSchema.parse(body);
    const actor = req.user as AuthUser;
    const user = await this.userService.createUserByAdmin(payload, actor);

    return { data: user };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'supperwizer', 'lead')
  async listUsers(@Query() query: unknown) {
    const parsed = paginationSchema.parse(query);
    return this.userService.getUsers(parsed.page, parsed.limit);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = objectIdSchema.parse(id);
    const actor = req.user as AuthUser;

    if (actor.sub !== userId && actor.role === 'user') {
      throw new HttpError(403, 'Insufficient permissions to view this user');
    }

    const user = await this.userService.getUserById(userId);
    return { data: user };
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() body: unknown, @Req() req: RequestWithUser) {
    const userId = objectIdSchema.parse(id);
    const payload = updateUserSchema.parse(body);
    const actor = req.user as AuthUser;

    const updated = await this.userService.patchUser(userId, actor, payload);
    return { data: updated };
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id') id: string, @Req() req: RequestWithUser): Promise<void> {
    const userId = objectIdSchema.parse(id);
    const actor = req.user;

    if (!actor) {
      throw new HttpError(401, 'Authorization token is missing or malformed');
    }

    await this.userService.removeUser(userId, actor);
  }
}

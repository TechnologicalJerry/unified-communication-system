import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { USER_ROLES, type UserRole } from './user.roles';

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 100 })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, maxlength: 255 })
  email!: string;

  @Prop({ required: true, minlength: 8 })
  password!: string;

  @Prop({ required: true, enum: USER_ROLES, default: 'user' })
  role!: UserRole;

  createdAt!: Date;
  updatedAt!: Date;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });

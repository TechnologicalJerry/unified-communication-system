import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { User } from '../users/user.schema';

@Schema({ timestamps: true, versionKey: false })
export class PasswordResetToken {
  @Prop({ type: Types.ObjectId, required: true, ref: User.name })
  userId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  tokenHash!: string;

  @Prop({ required: true, index: true })
  expiresAt!: Date;

  @Prop({ default: null })
  usedAt!: Date | null;

  createdAt!: Date;
  updatedAt!: Date;
}

export type PasswordResetTokenDocument = HydratedDocument<PasswordResetToken>;

export const PasswordResetTokenSchema = SchemaFactory.createForClass(PasswordResetToken);

PasswordResetTokenSchema.index({ userId: 1, createdAt: -1 });

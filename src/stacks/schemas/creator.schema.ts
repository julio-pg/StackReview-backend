import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TokenPayload } from 'google-auth-library';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type CreatorDocument = HydratedDocument<Creator>;

@Schema()
export class Creator {
  @Prop({ required: true, default: () => `CR-${uuidv4().substring(0, 6)}` })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    unique: true,
    default: () => `user${uuidv4().substring(0, 6)}`,
  })
  username: string;

  @Prop({ required: true })
  avatar: string;

  @Prop({ required: true })
  expertise: string;

  @Prop({ required: true })
  bio: string;
  @Prop({ required: false })
  github: string;
  @Prop({ required: false })
  twitter: string;

  @Prop({ type: Object, required: true })
  googleUser: TokenPayload;
}

export const CreatorSchema = SchemaFactory.createForClass(Creator);

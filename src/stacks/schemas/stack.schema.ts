import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { Technology } from './technology.schema';
import { Review } from './review.schema';

export type StackDocument = HydratedDocument<Stack>;

@Schema({ timestamps: true })
export class Stack {
  @Prop({ required: true, default: () => `SR-${uuidv4().substring(0, 6)}` })
  id: string;

  @Prop({ required: true, maxLength: 100 })
  title: string;

  @Prop({ required: true, maxLength: 1000 })
  description: string;

  @Prop({ required: false, default: 0 })
  rating: number;

  @Prop({ type: Array<Review>, required: false, default: [] })
  reviews: Review[];

  @Prop({ required: true })
  category: Category;

  @Prop({ type: Array<Technology>, required: true })
  technologies: Technology[];

  @Prop({
    type: Types.ObjectId,
    ref: 'Creator',
    required: true,
  })
  creator: Types.ObjectId;
}

export type Category = 'programming' | 'design' | 'marketing' | 'business';

export const StackSchema = SchemaFactory.createForClass(Stack);

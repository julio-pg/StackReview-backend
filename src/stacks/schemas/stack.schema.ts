import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Creator } from './creator.schema';
import { Review } from './Review.schema';

export type StackDocument = HydratedDocument<Stack>;

@Schema({ timestamps: true })
export class Stack {
  @Prop({ required: true, default: () => `SR-${uuidv4().substring(0, 6)}` })
  id: string;
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: false, default: 0 })
  rating: number;

  @Prop({ type: Array<Review>, required: false, default: [] })
  reviews: Review[];

  @Prop({ required: true })
  category: string;

  @Prop({ type: Array<Technology>, required: true })
  technologies: Technology[];

  @Prop({ type: Object, required: true })
  creator: CreatorMini;
}
export type CreatorMini = Pick<
  Creator,
  'id' | 'avatar' | 'name' | 'username' | 'expertise'
>;

export interface Technology {
  name: string;
  category: string;
  website: string;
}

export const StackSchema = SchemaFactory.createForClass(Stack);

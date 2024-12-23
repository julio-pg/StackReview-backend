import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Creator } from './creator.schema';
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

  // TODO: add enum type for the category "programming", "design", "marketing", "business"
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

export const StackSchema = SchemaFactory.createForClass(Stack);

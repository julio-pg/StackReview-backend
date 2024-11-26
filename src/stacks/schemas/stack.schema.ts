import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Creator } from './creator.schema';

export type StackDocument = HydratedDocument<Stack>;

@Schema({ timestamps: true })
export class Stack {
  @Prop({ required: true, default: () => `SR-${uuidv4().substring(0, 6)}` })
  id: string;
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, default: 0 })
  rating: number;

  // @Prop({ required: true, default: 0 })
  // reviews: number;

  @Prop({ type: [String], required: true })
  tags: string[];

  @Prop({ type: Array<Technology>, required: true })
  technologies: Technology[];

  @Prop({ type: Creator, required: true })
  creator: Creator;
}
export interface Technology {
  name: string;
  version: string;
  description: string;
  category: string;
  website: string;
}

export const StackSchema = SchemaFactory.createForClass(Stack);

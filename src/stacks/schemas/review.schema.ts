import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CreatorMini } from './stack.schema';

export type ReviewDocument = HydratedDocument<Review>;

@Schema()
export class Review {
  @Prop({ required: true })
  stackId: string;

  @Prop({ required: true })
  creator: CreatorMini;

  @Prop({ required: true })
  rate: number;

  @Prop({ required: true })
  comment: string;

  @Prop({ required: true })
  createdAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

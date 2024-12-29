import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema()
export class Review {
  @Prop({ required: true })
  stackId: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Creator',
    required: true,
  })
  creator: Types.ObjectId;

  @Prop({ required: true })
  rate: number;

  @Prop({ required: true })
  comment: string;

  @Prop({ required: true })
  createdAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

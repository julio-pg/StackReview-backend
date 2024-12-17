import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StackDocument = HydratedDocument<Technology>;

@Schema()
export class Technology {
  @Prop()
  name: string;

  @Prop()
  category: string;

  @Prop()
  tag: string;

  @Prop()
  website: string;
  @Prop()
  description: string;
}
export const TechnologySchema = SchemaFactory.createForClass(Technology);

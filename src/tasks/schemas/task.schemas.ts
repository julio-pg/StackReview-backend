import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

export type SubTask = {
  id: string;
  content: string;
  exp: number;
  isDone: boolean;
};

@Schema()
export class Task {
  @Prop()
  id: string;

  @Prop()
  title: string;

  @Prop()
  content: SubTask[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);

import { Module } from '@nestjs/common';
import { StacksService } from './stacks.service';
import { StacksController } from './stacks.controller';
import { StackSchema } from './schemas/stack.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Stack } from './schemas/stack.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Stack.name, schema: StackSchema }]),
  ],
  controllers: [StacksController],
  providers: [StacksService],
})
export class StacksModule {}

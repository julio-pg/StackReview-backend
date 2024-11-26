import { Module } from '@nestjs/common';
import { StacksService } from './stacks.service';
import { StacksController } from './stacks.controller';
import { StackSchema } from './schemas/stack.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Stack } from './schemas/stack.schema';
import { Creator, CreatorSchema } from './schemas/creator.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Stack.name, schema: StackSchema },
      { name: Creator.name, schema: CreatorSchema },
    ]),
  ],
  controllers: [StacksController],
  providers: [StacksService],
})
export class StacksModule {}

import { Injectable } from '@nestjs/common';
import { CreateStackDto } from './dto/create-stack.dto';
import { UpdateStackDto } from './dto/update-stack.dto';
import { Stack } from './schemas/stack.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class StacksService {
  constructor(@InjectModel(Stack.name) private stackModel: Model<Stack>) {}

  async create(createStackDto: CreateStackDto) {
    return await this.stackModel.create(createStackDto);
  }

  async findAll() {
    return await this.stackModel.find();
  }

  async findOne(id: string) {
    return await this.stackModel.findOne({ id });
  }

  async update(id: string, updateStackDto: UpdateStackDto) {
    return await this.stackModel.findByIdAndUpdate(id, updateStackDto);
  }

  async remove(id: string) {
    return await this.stackModel.findByIdAndDelete(id);
  }
}

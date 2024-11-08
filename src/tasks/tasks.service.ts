import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SubTask, Task } from './schemas/task.schemas';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async create(createTaskDto: CreateTaskDto) {
    const subsWithId = createTaskDto.content.map((sub) => {
      const newSub: SubTask = {
        id: uuidv4(),
        exp: 100 / createTaskDto.content.length,
        ...sub,
      };
      return newSub;
    });
    const taskWithId = {
      id: uuidv4(),
      title: createTaskDto.title,
      content: subsWithId,
    };
    return await this.taskModel.create(taskWithId);
  }

  findAll() {
    return `This action returns all tasks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} task`;
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}

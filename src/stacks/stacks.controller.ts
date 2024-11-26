import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StacksService } from './stacks.service';
import { CreateStackDto } from './dto/create-stack.dto';
import { UpdateStackDto } from './dto/update-stack.dto';

@Controller('stacks')
export class StacksController {
  constructor(private readonly stacksService: StacksService) {}

  @Post('/create')
  async create(@Body() createStackDto: CreateStackDto) {
    return await this.stacksService.create(createStackDto);
  }

  @Get('/all')
  async findAll() {
    return await this.stacksService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.stacksService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStackDto: UpdateStackDto,
  ) {
    return await this.stacksService.update(id, updateStackDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.stacksService.remove(id);
  }

  @Post('/signin')
  async handleSignIn(@Body('credential') credential: string) {
    return await this.stacksService.handleSignIn(credential);
  }

  @Post('/login')
  async handleLogin(@Body('credential') credential: string) {
    return await this.stacksService.handleLogin(credential);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { StacksService } from './stacks.service';
import { CreateStackDto } from './dto/create-stack.dto';
// import { UpdateStackDto } from './dto/update-stack.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { Technology } from './schemas/technology.schema';

@Controller('stacks')
export class StacksController {
  constructor(private readonly stacksService: StacksService) {}

  @Post('/create')
  async create(@Body() createStackDto: CreateStackDto) {
    return await this.stacksService.create(createStackDto);
  }

  @Post('/review')
  async createReview(@Body() createReviewDto: CreateReviewDto) {
    return await this.stacksService.addReview(createReviewDto);
  }
  @Get('/all')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.stacksService.findAll(page, limit);
  }
  @Get('/user-stacks')
  async findUserStacks(
    @Query('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.stacksService.findUserStacks(userId, page, limit);
  }

  @Get('/single-stack/:id')
  async findOne(@Param('id') id: string) {
    return await this.stacksService.findOne(id);
  }

  // @Patch(':id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateStackDto: UpdateStackDto,
  // ) {
  //   return await this.stacksService.update(id, updateStackDto);
  // }

  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   return await this.stacksService.remove(id);
  // }

  @Post('/signup')
  async handleSignUp(@Body('credential') credential: string) {
    return await this.stacksService.handleSignUp(credential);
  }

  @Post('/login')
  async handleLogin(@Body('credential') credential: string) {
    return await this.stacksService.handleLogin(credential);
  }

  @Get('/top-rated')
  async getTopRatedStacks() {
    try {
      return await this.stacksService.getTopRatedStacks();
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Failed to get top rated stacks');
    }
  }
  @Post('/add-new-technologies')
  async addNewTechnologies(@Body() technologies: Technology[]) {
    const newTechs = await this.stacksService.addNewTechnologies(technologies);
    if (newTechs) {
      return 'New techs added successfully';
    }
  }

  @Get('/all-technologies')
  async getAllTechnologies() {
    try {
      return await this.stacksService.getAllTechnologies();
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Failed to get all technologies');
    }
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStackDto } from './dto/create-stack.dto';
import { CreatorMini, Stack } from './schemas/stack.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { Creator } from './schemas/creator.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './schemas/review.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Technology } from './schemas/technology.schema';
import { UpdateCreatorDto } from './dto/update-creator.dto';

@Injectable()
export class StacksService {
  constructor(
    @InjectModel(Stack.name) private stackModel: Model<Stack>,
    @InjectModel(Creator.name) private creatorModel: Model<Creator>,
    @InjectModel(Technology.name) private technologyModel: Model<Technology>,
  ) {}

  async create(createStackDto: CreateStackDto) {
    try {
      const creatorMini: CreatorMini = await this.getCreatorMini(
        createStackDto.creatorId,
      );

      const newStack: Omit<Stack, 'id' | 'rating' | 'reviews'> = {
        title: createStackDto.title,
        description: createStackDto.description,
        category: createStackDto.category,
        technologies: createStackDto.technologies,
        creator: creatorMini,
      };
      return await this.stackModel.create(newStack);
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Failed to create stack');
    }
  }

  async addReview(createReviewDto: CreateReviewDto) {
    try {
      const stack = await this.stackModel.findOne({
        id: createReviewDto.stackId,
      });
      if (!stack) {
        throw new NotFoundException('Stack not found');
      }
      const creatorMini = await this.getCreatorMini(createReviewDto.creatorId);
      const newReview: Review = {
        stackId: createReviewDto.stackId,
        creator: creatorMini,
        rate: createReviewDto.rate,
        comment: createReviewDto.comment,
        createdAt: new Date(),
      };
      await this.stackModel.findOneAndUpdate(
        { id: createReviewDto.stackId },
        { $push: { reviews: newReview } },
      );
      return stack;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Failed to add review');
    }
  }

  private async getCreatorMini(creatorId: string): Promise<CreatorMini> {
    try {
      const creatorData = await this.creatorModel.findOne({ id: creatorId });
      if (!creatorData) {
        throw new NotFoundException('Creator not found');
      }
      const creatorMini: CreatorMini = {
        id: creatorData.id,
        name: creatorData.name,
        username: creatorData.username,
        avatar: creatorData.avatar,
        expertise: creatorData.expertise,
      };
      return creatorMini;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Failed to fetch creator');
    }
  }

  async findAll(page: number, limit: number) {
    try {
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      const results = await this.stackModel
        .find()
        .skip(startIndex)
        .limit(limit)
        .exec();

      const total = await this.stackModel.countDocuments();
      const totalPages = Math.ceil(total / limit);

      const metadata = {
        total,
        page,
        limit,
        totalPages,
        next: {},
        previous: {},
      };

      if (endIndex < total) {
        metadata.next = {
          page: +page + 1,
          limit: +limit,
        };
      }

      if (startIndex > 0) {
        metadata.previous = {
          page: +page - 1,
          limit: +limit,
        };
      }

      return { data: results, metadata };
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Failed to fetch stacks');
    }
  }

  async findOne(id: string) {
    try {
      const stack = await this.stackModel.findOne({ id });
      if (!stack) {
        throw new NotFoundException('Stack not found');
      }
      return stack;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Failed to fetch stack');
    }
  }

  async findUserStacks(userId: string, page: number, limit: number) {
    try {
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      const results = await this.stackModel
        .find({ 'creator.id': userId })
        .skip(startIndex)
        .limit(limit)
        .exec();

      const total = await this.stackModel.countDocuments({
        'creator.id': userId,
      });

      const totalPages = Math.ceil(total / limit);

      const metadata = {
        total,
        page,
        limit,
        totalPages,
        next: {},
        previous: {},
      };

      if (endIndex < total) {
        metadata.next = {
          page: +page + 1,
          limit: +limit,
        };
      }

      if (startIndex > 0) {
        metadata.previous = {
          page: +page - 1,
          limit: +limit,
        };
      }

      return { data: results, metadata };
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Failed to get user stacks');
    }
  }

  async updateCreator(id: string, updateCreatorDto: UpdateCreatorDto) {
    try {
      const newCreator = await this.creatorModel.findOneAndUpdate(
        { id },
        updateCreatorDto,
        { new: true },
      );
      if (!newCreator) {
        throw new NotFoundException('Creator not found');
      }
      return newCreator;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Failed to update Creator');
    }
  }

  async remove(stackId: string) {
    try {
      const stack = await this.stackModel.findOneAndDelete({ id: stackId });
      if (!stack) {
        throw new NotFoundException('Stack not found');
      }
      return stack;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Failed to delete stack');
    }
  }

  async handleGoogleAuth(credential: string) {
    try {
      const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI,
      );
      // console.log(credential);
      const token = await client.getToken(credential);
      const ticket = await client.verifyIdToken({
        idToken: token.tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      return payload;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Failed to authenticate with Google');
    }
  }

  async handleSignUp(credential: string) {
    try {
      const payload: TokenPayload = await this.handleGoogleAuth(credential);

      const existingUser = await this.creatorModel.findOne({
        'googleUser.email': payload.email,
      });
      if (existingUser) {
        throw new BadRequestException('Email already used');
      }
      return await this.creatorModel.create({
        name: payload.name,
        avatar: payload.picture,
        expertise: 'Software Engineer',
        bio: 'I am a software engineer',
        googleUser: payload,
      });
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Failed to sign in');
    }
  }

  async handleLogin(credential: string) {
    try {
      const payload: TokenPayload = await this.handleGoogleAuth(credential);
      const creator = await this.creatorModel.findOne({
        'googleUser.sub': payload.sub,
      });
      if (!creator) {
        throw new NotFoundException('Creator not found');
      }
      return creator;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Failed to login');
    }
  }

  // @Cron(CronExpression.EVERY_30_SECONDS)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private async calculateDailyTaskRates() {
    try {
      const stacks = await this.stackModel.find();
      for (const stack of stacks) {
        let totalRating = 0;
        let reviewCount = 0;
        for (const review of stack.reviews) {
          totalRating += review.rate;
          reviewCount++;
        }
        if (reviewCount > 0) {
          const averageRating = totalRating / reviewCount;
          await this.stackModel.findOneAndUpdate(
            { id: stack.id },
            { rating: averageRating },
          );
        }
      }
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Failed to calculate daily task rates');
    }
  }

  async getStacksByCategory(category: string): Promise<Stack[]> {
    try {
      const stacks = await this.stackModel.find({ category });
      return stacks;
    } catch (error) {
      console.log(error);
      throw new NotFoundException(
        `Failed to get stacks for category: ${category}`,
      );
    }
  }

  async getTopRatedStacks(): Promise<Stack[]> {
    try {
      const topRatedStacks = await this.stackModel
        .find()
        .sort({ rating: -1 })
        .limit(3);
      return topRatedStacks;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Failed to get top rated stacks');
    }
  }

  async addNewTechnologies(technologies: Technology[]) {
    try {
      return await this.technologyModel.insertMany(technologies);
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Failed to add new technologies');
    }
  }
  async getAllTechnologies(): Promise<{ [x: string]: Technology[] }> {
    try {
      const techs = await this.technologyModel.find();
      const techsByCategory = techs.reduce((acc, tech) => {
        if (!acc[tech.category]) {
          acc[tech.category] = [];
        }
        acc[tech.category].push(tech);
        return acc;
      }, {});
      return techsByCategory;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Failed to get all technologies');
    }
  }
}

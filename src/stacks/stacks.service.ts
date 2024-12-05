import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStackDto } from './dto/create-stack.dto';
import { UpdateStackDto } from './dto/update-stack.dto';
import { CreatorMini, Stack } from './schemas/stack.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { Creator } from './schemas/creator.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './schemas/Review.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class StacksService {
  constructor(
    @InjectModel(Stack.name) private stackModel: Model<Stack>,
    @InjectModel(Creator.name) private creatorModel: Model<Creator>,
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

  async findAll() {
    try {
      const data = await this.stackModel.find();

      return data;
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

  async findUserStacks(userId: string) {
    try {
      const data = await this.stackModel.find({ 'creator.id': userId });
      return data;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Failed to get user stacks');
    }
  }

  async update(id: string, updateStackDto: UpdateStackDto) {
    try {
      const stack = await this.stackModel.findByIdAndUpdate(id, updateStackDto);
      if (!stack) {
        throw new NotFoundException('Stack not found');
      }
      return stack;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Failed to update stack');
    }
  }

  async remove(id: string) {
    try {
      const stack = await this.stackModel.findByIdAndDelete(id);
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
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload: TokenPayload = ticket.getPayload();
      return payload;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Failed to authenticate with Google');
    }
  }

  async handleSignIn(credential: string) {
    try {
      const payload: TokenPayload = await this.handleGoogleAuth(credential);
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
}

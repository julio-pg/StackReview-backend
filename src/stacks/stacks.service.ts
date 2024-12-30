import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStackDto } from './dto/create-stack.dto';
import { Category, Stack } from './schemas/stack.schema';
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
      const { _id } = await this.creatorModel.findOne({
        id: createStackDto.creatorId,
      });

      const newStack: Omit<Stack, 'id' | 'rating' | 'reviews'> = {
        title: createStackDto.title,
        description: createStackDto.description,
        category: createStackDto.category as Category,
        technologies: createStackDto.technologies,
        creator: _id,
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
      const { _id } = await this.creatorModel.findOne({
        id: createReviewDto.creatorId,
      });
      const newReview: Review = {
        stackId: createReviewDto.stackId,
        creator: _id,
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

  async findAll({
    page,
    limit,
    category,
    rating,
  }: {
    page: number;
    limit: number;
    category?: string;
    rating?: number;
  }) {
    try {
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      const query: Record<string, any> = {
        ...(category && { category }),
        ...(rating && { rating }),
      };

      const results = await this.stackModel
        .find(query)
        .populate({
          path: 'creator',
          select: 'id avatar name username expertise',
        })
        .skip(startIndex)
        .limit(limit)
        .exec();

      const total = await this.stackModel.countDocuments(query);
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
      const stack = await this.stackModel
        .findOne({ id })
        .populate({
          path: 'creator',
          select: 'id avatar name username expertise',
        })
        .populate({
          path: 'reviews', // Populate the reviews array
          populate: {
            path: 'creator', // Populate the creator field in each review
            model: 'Creator', // Specify the model for the creator field
            select: 'id avatar name username expertise',
          },
        })
        .exec();
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
      const { _id } = await this.creatorModel.findOne({ id: userId });
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      const results = await this.stackModel
        .find({ creator: _id })
        .populate({
          path: 'creator',
          select: 'id avatar name username expertise',
        })
        .skip(startIndex)
        .limit(limit)
        .exec();

      const total = await this.stackModel.countDocuments({
        creator: _id,
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

  async getSingleUser(userId: string) {
    try {
      return await this.creatorModel.findOne({ id: userId });
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Failed to get user');
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
        .populate({
          path: 'creator',
          select: 'id avatar name username expertise',
        })
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

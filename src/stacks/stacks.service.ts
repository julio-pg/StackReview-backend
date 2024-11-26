import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStackDto } from './dto/create-stack.dto';
import { UpdateStackDto } from './dto/update-stack.dto';
import { Stack } from './schemas/stack.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { Creator } from './schemas/creator.schema';

@Injectable()
export class StacksService {
  constructor(
    @InjectModel(Stack.name) private stackModel: Model<Stack>,
    @InjectModel(Creator.name) private creatorModel: Model<Creator>,
  ) {}

  async create(createStackDto: CreateStackDto) {
    try {
      return await this.stackModel.create(createStackDto);
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Failed to create stack');
    }
  }

  async findAll() {
    try {
      return await this.stackModel.find();
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
        username: payload.name.replace(/\s/g, ''),
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
}

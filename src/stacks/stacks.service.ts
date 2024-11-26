import { Injectable } from '@nestjs/common';
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

  async handleSignIn(credential: string) {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload: TokenPayload = ticket.getPayload();

    // Handle user data (e.g., save to DB, create session)
    return await this.creatorModel.create({
      name: payload.name,
      username: payload.name,
      avatar: payload.picture,
      expertise: 'Software Engineer',
      bio: 'I am a software engineer',
      googleUser: payload,
    });
  }
}

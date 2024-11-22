import { Technology } from '../schemas/stack.schema';

export class CreateStackDto {
  readonly title: string;
  readonly description: string;
  readonly rating: number;
  readonly tags: string[];
  readonly creator: {
    name: string;
    username: string;
    avatar: string;
    expertise: string;
    bio: string;
  };
  readonly technologies: Technology[];
}

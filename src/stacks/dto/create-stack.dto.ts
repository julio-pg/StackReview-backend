import { Technology } from '../schemas/stack.schema';

export class CreateStackDto {
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly creatorId: string;
  readonly technologies: Technology[];
}

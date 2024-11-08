export class CreateTaskDto {
  readonly title: string;
  readonly content: SubTask[];
}

export type SubTask = {
  content: string;
  exp: number;
  isDone: false;
};

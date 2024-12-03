export class CreateReviewDto {
  readonly stackId: string;
  readonly creatorId: string;
  readonly rate: number;
  readonly comment: string;
}

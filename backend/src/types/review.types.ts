import { Review, User } from '@prisma/client';

export interface ReviewWithUser extends Review {
  user: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

export interface ReviewListResponse {
  items: ReviewWithUser[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ReviewResponse {
  data: ReviewWithUser;
  message: string;
}

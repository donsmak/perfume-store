export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface BaseApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  code?: string;
}

export interface SuccessResponse<T> extends BaseApiResponse<T> {
  status: 'success';
  data: T;
}

export interface ErrorResponse extends BaseApiResponse<never> {
  status: 'error';
  message: string;
  code: string;
  stack?: string;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

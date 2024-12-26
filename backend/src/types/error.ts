export interface AppError extends Error {
  statusCode: number;
  code?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

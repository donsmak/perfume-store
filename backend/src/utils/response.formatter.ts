import { AppError } from "./errors";

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const formatResponse = <T>(data: T, message?: string, meta?: PaginationMeta) => {
  return {
    success: true,
    data,
    ...(message && { message }),
    ...(meta && { meta }),
    timestamp: new Date().toISOString(),
  };
};

export const formatErrorResponse = (error: AppError) => {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    },
    timestamp: new Date().toISOString(),
  };
};

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
    this.code = 'NOT_FOUND';
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, message);
    this.code = 'BAD_REQUEST';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
    this.code = 'VALIDATION_ERROR';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(401, message);
    this.code = 'AUTHENTICATION_ERROR';
  }
}
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message);
    this.code = 'FORBIDDEN_ERROR';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Not authorized') {
    super(403, message);
    this.code = 'AUTHORIZATION_ERROR';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(500, message);
    this.code = 'DATABASE_ERROR';
  }
}

export class CacheError extends AppError {
  constructor(message: string) {
    super(500, message);
    this.code = 'CACHE_ERROR';
  }
}

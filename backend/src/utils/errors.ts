export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Not found') {
    super(404, message);
  }
}

export class ValidationError extends ApiError {
  details: any;

  constructor(message = 'Validation error', details: any = null) {
    super(400, message);
    this.details = details;
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication failed') {
    super(401, message);
  }
}

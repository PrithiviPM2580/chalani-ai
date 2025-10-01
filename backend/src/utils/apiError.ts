export class APIError extends Error {
  public statusCode: number;
  public status: string;
  public errors: Array<{ field?: string; message: string }>;

  constructor(
    statusCode = 500,
    message = 'Something went wrong',
    errors: Array<{ field?: string; message: string }> = [],
    stack?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    this.status = 'error';
    this.statusCode = statusCode;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

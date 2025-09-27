export class APIError extends Error {
  public status: string;
  public statusCode: number;
  public errors: Array<{ field?: string; message: string }>;

  constructor(
    status = "error",
    statusCode = 500,
    message = "Something went wrong",
    errors: Array<{ field?: string; message: string }> = [],
    stack?: string
  ) {
    super(message); // ✅ Call Error constructor first
    this.name = this.constructor.name; // "APIError"
    this.status = status;
    this.statusCode = statusCode;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

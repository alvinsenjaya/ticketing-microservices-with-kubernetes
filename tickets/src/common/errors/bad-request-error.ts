import { customError } from '../errors/custom-error';

export class BadRequestError extends customError {
  statusCode = 400;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{
      message: this.message,
    }]
  }
}

import { customError } from './custom-error';

export class NotFoundError extends customError {
  statusCode = 404;
  message = 'Not found';

  constructor() {
    super('Not found');

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{
      message: this.message,
    }]
  }
}

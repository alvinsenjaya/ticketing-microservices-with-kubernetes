import { customError } from './custom-error';

export class NotAuthorizedError extends customError {
  statusCode = 401;
  message = 'Unauthorized Access';

  constructor() {
    super('Unauthorized Access');

    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  serializeErrors() {
    return [{
      message: this.message,
    }]
  }
}

import { ValidationError } from 'express-validator';
import { customError } from '../errors/custom-error';

export class RequestValidationError extends customError {
  statusCode= 400;

  constructor(public errors: ValidationError[]) {
    super('Invalid request parameters');

    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map(error => {
      return {
        message: error.msg,
        field: error.param
      }
    });
  }
}

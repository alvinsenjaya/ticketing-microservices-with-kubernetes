import { Request, Response, NextFunction } from 'express';
import { customError } from '../errors/custom-error';

export const errorHandler = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  if(err instanceof customError){
    return res.status(err.statusCode).json({
      errors: err.serializeErrors()
    })
  }
  
  console.log(err);

  return res.status(500).json({
    errors: [{ message: 'Something happened' }]
  });
};
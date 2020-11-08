import {Request, Response, NextFunction} from 'express';
import mongoose from 'mongoose';
import { BadRequestError } from '../errors/bad-request-error';

export const validateId = (req: Request, res: Response, next: NextFunction) => {
  if(!mongoose.isValidObjectId(req.params.id)){
    throw new BadRequestError('Invalid id');
  }

  next();
}
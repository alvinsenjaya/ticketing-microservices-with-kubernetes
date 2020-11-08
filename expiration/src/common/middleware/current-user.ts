import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string,
  email: string,
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload
    }
  }
}

export const currentUser = (req: Request, res: Response, next: NextFunction) => {
  if(!req.signedCookies['x-auth-token']){
    return next();
  }

  try {
    const payload = jwt.verify(req.signedCookies['x-auth-token'], process.env.JWT_KEY!) as UserPayload;
    req.currentUser = payload;

  } catch (err) {}

  next();
};

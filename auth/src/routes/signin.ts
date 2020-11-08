import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { validateRequest } from '../common/middleware/validate-request';
import { User } from '../models/user';
import { BadRequestError } from '../common/errors/bad-request-error';
import { Password } from '../services/password';

const router = express.Router();

router.post('/api/users/signin', [
  body('email')
    .isEmail()
    .withMessage('Please supply valid email'),
  body('password')
    .notEmpty()
    .withMessage('Please supply password')
],
validateRequest,
async (req: Request, res: Response) => {
  const { email, password } = req.body;

  //Check for existing user email
  const existingUser = await User.findOne({ email: email });
  if(!existingUser){
    throw new BadRequestError('Invalid email or password');
  }

  const passwordMatch = await Password.compare(existingUser.password, password);

  if(!passwordMatch){
    throw new BadRequestError('Invalid email or password');
  }

  // Generate json web token
  const userJwt = jwt.sign({
    id: existingUser.id,
    email: existingUser.email
  }, 
    process.env.JWT_KEY!
  );

  res.cookie('x-auth-token', userJwt, {
    maxAge: 15 * 60 * 1000,
    expires: new Date(Date.now() + 15 * 60 * 1000),
    secure: false,
    httpOnly: true,
    signed: true,
    sameSite: 'strict'
  });

  return res.status(200).json(existingUser);
});

export { router as signinRouter };

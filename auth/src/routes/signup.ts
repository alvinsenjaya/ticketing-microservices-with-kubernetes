import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { validateRequest } from '../common/middleware/validate-request';
import { BadRequestError } from '../common/errors/bad-request-error';
import { User } from '../models/user';

const router = express.Router();

router.post('/api/users/signup', [
  body('email')
    .isEmail()
    .withMessage('Invalid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    //Check for existing user email
    const existingUser = await User.findOne({ email: email });
    if(existingUser){
      throw new BadRequestError('Email already registered');
    }

    const user = User.build({email, password});
    await user.save();

    // Generate json web token
    const userJwt = jwt.sign({
      id: user.id,
      email: user.email
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

    res.status(201).json(user);
});

export { router as signupRouter };

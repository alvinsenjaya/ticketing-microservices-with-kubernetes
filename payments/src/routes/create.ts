import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { BadRequestError } from '../common/errors/bad-request-error';
import { NotAuthorizedError } from '../common/errors/not-authorized-error';
import { NotFoundError } from '../common/errors/not-found-error';
import { currentUser } from '../common/middleware/current-user';
import { requireAuth } from '../common/middleware/require-auth';
import { validateRequest } from '../common/middleware/validate-request';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { Order, OrderStatus } from '../models/order';
import { Payment } from '../models/payment';
import { natsWrapper } from '../nats-wrapper';
import { stripe } from '../stripe';

const router = express.Router();

router.post('/api/payments',
  currentUser,
  requireAuth,
  [
    body('token')
      .notEmpty(),
    body('orderId')
      .notEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('Please provide valid ticket id'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    const order = await Order.findById(orderId);

    if(!order){
      throw new NotFoundError();
    }

    if(order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if(order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for cancelled order');
    }

    // Charge with stripe
    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100, // convert to cent
      source: token
    });

    const payment = Payment.build({
      orderId: orderId,
      stripeId: charge.id
    });
    await payment.save();

    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId
    });

    res.status(201).json({
      id: payment.id
    })
  }
);

export { router as CreatePaymentRouter };
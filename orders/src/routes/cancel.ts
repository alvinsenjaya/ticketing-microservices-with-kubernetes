import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';

import { Order, OrderStatus } from '../models/order';
import { requireAuth } from '../common/middleware/require-auth';
import { currentUser } from '../common/middleware/current-user';
import { validateId } from '../common/middleware/validate-id';
import { NotFoundError } from '../common/errors/not-found-error';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/orders/cancel/:id', currentUser, requireAuth, validateId, async (req: Request, res: Response) => {
  const order = await Order.findOne({
    _id: req.params.id, 
    userId: req.currentUser!.id
  }).populate('ticket');

  if(!order){
    throw new NotFoundError();
  }
    
  order.set({
    status: OrderStatus.Cancelled
  });
  await order.save();

  new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    __v: order.__v!,
    ticket: {
      id: order.ticket.id,
    }
  });

  return res.status(200).json(order);
});

export { router as CancelOrderRouter };

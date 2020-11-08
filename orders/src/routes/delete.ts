import express, { Request, Response } from 'express';

import { Order, OrderStatus } from '../models/order';
import { requireAuth } from '../common/middleware/require-auth';
import { currentUser } from '../common/middleware/current-user';
import { validateId } from '../common/middleware/validate-id';
import { NotFoundError } from '../common/errors/not-found-error';
import { OrderDeletedPublisher } from '../events/publishers/order-deleted-publisher';
import { natsWrapper } from '../nats-wrapper';
import { BadRequestError } from '../common/errors/bad-request-error';

const router = express.Router();

router.delete('/api/orders/:id', currentUser, requireAuth, validateId, async (req: Request, res: Response) => {
  const order = await Order.findOne({
    _id: req.params.id, 
    userId: req.currentUser!.id
  }).populate('ticket');

  if(!order){
    throw new NotFoundError();
  }

  if(order.status !== OrderStatus.Cancelled){
    throw new BadRequestError('Cannot delete on process order. Please cancel order first');
  }

  await order.deleteOne();

  new OrderDeletedPublisher(natsWrapper.client).publish({
    id: order.id,
    __v: order.__v!,
    ticket: {
      id: order.ticket.id,
    }
  });

  return res.status(204).json({});
});

export { router as DeleteOrderRouter };

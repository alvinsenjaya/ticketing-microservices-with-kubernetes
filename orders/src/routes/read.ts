import express, { Request, Response } from 'express';

import { Order } from '../models/order';
import { validateId } from '../common/middleware/validate-id';
import { NotFoundError } from '../common/errors/not-found-error';
import { requireAuth } from '../common/middleware/require-auth';
import { currentUser } from '../common/middleware/current-user';

const router = express.Router();

router.get('/api/orders/:id', currentUser, requireAuth, validateId, async (req: Request, res: Response) => {
  const order = await Order.findOne({
    _id: req.params.id, 
  }).populate('ticket');
  
  if(!order){
    throw new NotFoundError();
  }

  if(req.currentUser!.id !== order.userId && req.currentUser!.id !== order.ticket.userId){
    throw new NotFoundError();
  }

  return res.status(200).json(order);
});

router.get('/api/orders/', currentUser, requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({userId: req.currentUser!.id}).populate('ticket');
  return res.status(200).json(orders);
});

export { router as ReadOrderRouter };

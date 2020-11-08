import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';

import { Order, OrderStatus} from '../models/order';
import { Ticket } from '../models/ticket';
import { requireAuth } from '../common/middleware/require-auth';
import { currentUser } from '../common/middleware/current-user';
import { validateRequest } from '../common/middleware/validate-request';
import { NotFoundError } from '../common/errors/not-found-error';
import { BadRequestError } from '../common/errors/bad-request-error';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post('/api/orders/', currentUser, requireAuth, [
  body('ticketId')
    .notEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('Please provide valid ticket id'),
  ],
  validateRequest, 
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    // Find the ticket the user is trying to order in database
    const ticket = await Ticket.findById(ticketId);
    if(!ticket){
      throw new NotFoundError();
    }

    // Make sure the ticket is not already reserved
    const isReserved = await ticket.isReserved();
    if(isReserved){
      throw new BadRequestError('Ticket is already reserved');
    }

    // User cannot buy their own ticket
    if(ticket.userId === req.currentUser!.id){
      throw new BadRequestError('Cannot purchase your own ticket');
    }

    // Calculate expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build order and save to database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket
    });

    await order.save();

    // publish event that order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      __v: order.__v!,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price
      }
    });

    res.status(201).json(order);
  }
);

export { router as CreateOrderRouter };

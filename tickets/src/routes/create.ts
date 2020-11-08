import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { Ticket } from '../models/ticket';
import { requireAuth } from '../common/middleware/require-auth';
import { currentUser } from '../common/middleware/current-user';
import { validateRequest } from '../common/middleware/validate-request';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/tickets/', currentUser, requireAuth, [
  body('title')
    .notEmpty()
    .withMessage('Please provide title'),
  body('price')
    .notEmpty()
    .withMessage('Please provide price')
    .isFloat({ gt: 0})
    .withMessage('Price must be greater than 0')
  ],
  validateRequest, 
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const userId = req.currentUser!.id;

    const ticket = Ticket.build({title, price, userId});
    await ticket.save();

    new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      __v: ticket.__v!,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId
    });

    res.status(201).json(ticket);
  }
);

export { router as CreateTicketRouter };

import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { Ticket } from '../models/ticket';
import { requireAuth } from '../common/middleware/require-auth';
import { currentUser } from '../common/middleware/current-user';
import { validateId } from '../common/middleware/validate-id';
import { validateRequest } from '../common/middleware/validate-request';
import { NotAuthorizedError } from '../common/errors/not-authorized-error';
import { NotFoundError } from '../common/errors/not-found-error';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';
import { BadRequestError } from '../common/errors/bad-request-error';

const router = express.Router();

router.put('/api/tickets/:id', currentUser, requireAuth, validateId, [
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
    const ticket = await Ticket.findById(req.params.id);

    if(!ticket){
      throw new NotFoundError();
    }

    if(ticket.userId!==req.currentUser!.id){
      throw new NotAuthorizedError();
    }

    if(ticket.orderId){
      throw new BadRequestError('Cannot edit reserved ticket');
    }
  
    ticket.set({
      title: req.body.title,
      price: req.body.price
    });
    await ticket.save()
    
    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      __v: ticket.__v!,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId
    });

    return res.status(200).json(ticket);
  }
);

export { router as UpdateTicketRouter };

import express, { Request, Response } from 'express';

import { Ticket } from '../models/ticket';
import { requireAuth } from '../common/middleware/require-auth';
import { currentUser } from '../common/middleware/current-user';
import { validateId } from '../common/middleware/validate-id';
import { NotAuthorizedError } from '../common/errors/not-authorized-error';
import { NotFoundError } from '../common/errors/not-found-error';
import { TicketDeletedPublisher } from '../events/publishers/ticket-deleted-publisher';
import { natsWrapper } from '../nats-wrapper';
import { BadRequestError } from '../common/errors/bad-request-error';

const router = express.Router();

router.delete('/api/tickets/:id', currentUser, requireAuth, validateId, async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);

  if(!ticket){
    throw new NotFoundError();
  }

  if(ticket.userId!==req.currentUser!.id){
    throw new NotAuthorizedError();
  }

  if(ticket.orderId){
    throw new BadRequestError('Cannot delete reserved ticket');
  }
  
  await ticket.deleteOne();

  new TicketDeletedPublisher(natsWrapper.client).publish({
    id: ticket.id,
    __v: ticket.__v!,
    title: ticket.title,
    price: ticket.price,
    userId: ticket.userId
  });

  return res.status(200).json({});
});

export { router as DeleteTicketRouter };

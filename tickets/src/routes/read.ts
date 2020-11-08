import express, { Request, Response } from 'express';

import { Ticket } from '../models/ticket';
import { validateId } from '../common/middleware/validate-id';
import { NotFoundError } from '../common/errors/not-found-error';
import { currentUser } from '../common/middleware/current-user';
import { requireAuth } from '../common/middleware/require-auth';

const router = express.Router();

router.get('/api/tickets/myticket', currentUser, requireAuth, async (req: Request, res: Response) => {
  const tickets = await Ticket.find({
    userId: req.currentUser!.id
  });

  return res.status(200).json(tickets);
});

router.get('/api/tickets/:id', validateId, async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);
  
  if(!ticket){
    throw new NotFoundError();
  }

  return res.status(200).json(ticket);
});

router.get('/api/tickets/', async (req: Request, res: Response) => {
  const tickets = await Ticket.find({
    orderId: undefined
  });
  return res.status(200).json(tickets);
});

export { router as ReadTicketRouter };

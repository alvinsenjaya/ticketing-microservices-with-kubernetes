import mongoose from 'mongoose'
import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async (done) => {
  // Create instance of ticket and save to database
  const ticket = await global.createTicket();

  // Fetch ticket twice separately
  const firstTicket = await Ticket.findById(ticket.id);
  const secondTicket = await Ticket.findById(ticket.id);

  // Update ticket twice separately
  firstTicket!.set({
    price: 15
  })

  secondTicket!.set({
    price: 20
  })

  // Save first fetched ticket
  await firstTicket!.save()

  // Save second fethced ticket, expect error
  try {
    await secondTicket!.save();
  } catch(err) {
    return done();
  }
  
  throw new Error('Should not reach this point');
});

it('increment version number on multiple save', async () => {
  const ticket = await global.createTicket();
  expect(ticket.__v).toEqual(0);

  ticket.set({
    price: 15
  })

  await ticket.save()
  expect(ticket.__v).toEqual(1);

  ticket.set({
    price: 20
  })

  await ticket.save()
  expect(ticket.__v).toEqual(2);
});

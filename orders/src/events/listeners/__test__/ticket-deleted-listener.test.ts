import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { natsWrapper } from '../../../nats-wrapper';
import { TicketDeletedListener } from '../ticket-deleted-listener';
import { TicketDeletedEvent } from '../../../common/events/ticket-deleted-event';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create and save ticket
  const ticket = await global.createTicket();

  // create instance of listener
  const listener = new TicketDeletedListener(natsWrapper.client);

  // create fake data event
  const data: TicketDeletedEvent['data'] = {
    id: ticket.id,
    __v: 1,
    title: 'title_change',
    price: 20,
    userId: mongoose.Types.ObjectId().toHexString()
  };

  // create fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { ticket, listener, data, msg };
}

it('throw error if ticket is not found', async (done) => {
  const { ticket, listener, data, msg } = await setup();

  // call onMessage function with data and message object
  data.id = mongoose.Types.ObjectId().toHexString();

  try{
    await listener.onMessage(data, msg);
  } catch(err){
    return done();
  }

  // it should never reach this point
  throw new Error('Should not reach this point');
})

it('not ack for skipped / out of order version number', async() => {
  const { ticket, listener, data, msg } = await setup();
  data.__v = data.__v + 100;

  // call onMessage function with data and message object
  try{
    await listener.onMessage(data, msg);
  } catch(err){

  }
  
  // write assertion to make ack is called
  expect(msg.ack).not.toHaveBeenCalled();
})

it('delete existing ticket', async () => {
  const { ticket, listener, data, msg } = await setup();

  // call onMessage function with data and message object
  await listener.onMessage(data, msg);

  // write assertion to make sure ticket is created
  const deletedTicket = await Ticket.findById(ticket.id);
  expect(deletedTicket).toBeNull();
})

it('ack the message', async () => {
  const { ticket, listener, data, msg } = await setup();

  // call onMessage function with data and message object
  await listener.onMessage(data, msg);

  // write assertion to make ack is called
  expect(msg.ack).toHaveBeenCalled();
})
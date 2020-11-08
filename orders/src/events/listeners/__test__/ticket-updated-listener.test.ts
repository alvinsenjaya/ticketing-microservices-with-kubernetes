import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { TicketUpdatedEvent } from '../../../common/events/ticket-updated-event';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create and save ticket
  const ticket = await global.createTicket();

  // create instance of listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create fake data event
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    __v: ticket.__v! + 1,
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

it('update existing ticket', async () => {
  const { ticket, listener, data, msg } = await setup();

  // call onMessage function with data and message object
  await listener.onMessage(data, msg);

  // write assertion to make sure ticket is created
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
})

it('increment version by 1', async () => {
  const { ticket, listener, data, msg } = await setup();

  // call onMessage function with data and message object
  await listener.onMessage(data, msg);

  // write assertion to make sure ticket is created
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.__v).toEqual(data.__v);
})


it('ack the message', async () => {
  const { ticket, listener, data, msg } = await setup();

  // call onMessage function with data and message object
  await listener.onMessage(data, msg);

  // write assertion to make ack is called
  expect(msg.ack).toHaveBeenCalled();
})
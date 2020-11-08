import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedListener } from '../ticket-created-listener';
import { TicketCreatedEvent } from '../../../common/events/ticket-created-event';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create instance of listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // create fake data event
  const data: TicketCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    __v: 0,
    title: 'title',
    price: 10,
    userId: mongoose.Types.ObjectId().toHexString()
  };

  // create fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg };
}

it('create and save ticket', async () => {
  const { listener, data, msg } = await setup();

  // call onMessage function with data and message object
  await listener.onMessage(data, msg);

  // write assertion to make sure ticket is created
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
})

it('ack the message', async () => {
  const { listener, data, msg } = await setup();

  // call onMessage function with data and message object
  await listener.onMessage(data, msg);

  // write assertion to make ack is called
  expect(msg.ack).toHaveBeenCalled();
})

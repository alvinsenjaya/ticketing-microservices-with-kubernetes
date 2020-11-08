import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import { OrderCreatedEvent } from '../../../common/events/order-created-event';
import { Ticket } from '../../../models/ticket';
import { OrderStatus } from '../../../common/types/order-status';

const setup = async () => {
  // create instance of listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create and save ticket
  const ticket = Ticket.build({
    title: 'title',
    price: 10,
    userId: mongoose.Types.ObjectId().toHexString()
  })

  await ticket.save();

  // create fake data event
  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    __v: 2,
    status: OrderStatus.Created,
    userId: mongoose.Types.ObjectId().toHexString(),
    expiresAt: Date(),
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  };

  // create fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { ticket, listener, data, msg };
}

it('reserve ticket', async () => {
  const { ticket, listener, data, msg } = await setup();

  // call onMessage function with data and message object
  await listener.onMessage(data, msg);

  // write assertion to make sure ticket is created
  const reservedTicket = await Ticket.findById(ticket.id);
  expect(reservedTicket!.orderId).toEqual(data.id);
})

it('ack the message', async () => {
  const { ticket, listener, data, msg } = await setup();

  // call onMessage function with data and message object
  await listener.onMessage(data, msg);

  // write assertion to make ack is called
  expect(msg.ack).toHaveBeenCalled();
})

it('publish ticket updated event', async () => {
  const { ticket, listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  // write assertion to make ack is called
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

  expect(ticketUpdatedData.orderId).toEqual(data.id);
})
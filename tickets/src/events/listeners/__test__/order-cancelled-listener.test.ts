import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { OrderCancelledEvent } from '../../../common/events/order-cancelled-event';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create instance of listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  // create and save ticket
  const ticket = Ticket.build({
    title: 'title',
    price: 10,
    userId: mongoose.Types.ObjectId().toHexString()
  })

  // reserve ticket
  ticket.orderId = mongoose.Types.ObjectId().toHexString();

  await ticket.save();

  // create fake data event
  const data: OrderCancelledEvent['data'] = {
    id: ticket.orderId,
    __v: 2,
    ticket: {
      id: ticket.id,
    }
  };

  // create fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { ticket, listener, data, msg };
}

it('cancel order', async () => {
  const { ticket, listener, data, msg } = await setup();

  // call onMessage function with data and message object
  await listener.onMessage(data, msg);

  // write assertion to make sure ticket is created
  const reservedTicket = await Ticket.findById(ticket.id);
  expect(reservedTicket!.orderId).toBeUndefined();
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

  expect(ticketUpdatedData.orderId).toBeUndefined();
})
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import { OrderCreatedEvent } from '../../../common/events/order-created-event';
import { Order } from '../../../models/order';
import { OrderStatus } from '../../../common/types/order-status';

const setup = async () => {
  // create instance of listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create fake data event
  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    __v: 0,
    status: OrderStatus.Created,
    userId: mongoose.Types.ObjectId().toHexString(),
    expiresAt: Date(),
    ticket: {
      id: mongoose.Types.ObjectId().toHexString(),
      price: 10
    }
  };

  // create fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg };
}

it('create and save order', async () => {
  const { listener, data, msg } = await setup();

  // call onMessage function with data and message object
  await listener.onMessage(data, msg);

  // write assertion to make sure ticket is created
  const order = await Order.findById(data.id);
  expect(order).toBeDefined();
  expect(order!.status).toEqual(data.status);
  expect(order!.userId).toEqual(data.userId);
  expect(order!.price).toEqual(data.ticket.price);
})

it('ack the message', async () => {
  const { listener, data, msg } = await setup();

  // call onMessage function with data and message object
  await listener.onMessage(data, msg);

  // write assertion to make ack is called
  expect(msg.ack).toHaveBeenCalled();
})

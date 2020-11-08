import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { ExpirationCompletedListener } from '../expiration-completed-listener';
import { ExpirationCompletedEvent } from '../../../common/events/expiration-completed-event';
import { Order, OrderStatus } from '../../../models/order';

const setup = async () => {
  const EXPIRATION_WINDOW_SECONDS = 15 * 60;
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

  const listener = new ExpirationCompletedListener(natsWrapper.client);

  const ticket = await global.createTicket();

  const order = Order.build({
    userId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: expiration,
    ticket
  });
  await order.save();

  const data: ExpirationCompletedEvent['data'] = {
    orderId: order.id
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, ticket, order, data, msg };
}

it('not update order status to cancelled if order is completed', async () => {
  const { listener, ticket, order, data, msg } = await setup();

  order.set({
    status: OrderStatus.Completed
  });
  await order.save();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Completed);
})

it('not emit order cancelled event if order is ocmpleted', async () => {
  const { listener, ticket, order, data, msg } = await setup();

  order.set({
    status: OrderStatus.Completed
  });
  await order.save();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).not.toHaveBeenCalled();
})


it('update order status to cancelled', async () => {
  const { listener, ticket, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
})

it('emit order cancelled event with correct orderId', async () => {
  const { listener, ticket, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const publishedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  expect(publishedData.id).toEqual(order.id);
})

it('ack the message', async () => {
  const { listener, ticket, order, data, msg } = await setup();

  // call onMessage function with data and message object
  await listener.onMessage(data, msg);

  // write assertion to make ack is called
  expect(msg.ack).toHaveBeenCalled();
})
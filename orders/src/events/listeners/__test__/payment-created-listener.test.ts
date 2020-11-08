import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { PaymentCreatedListener } from '../payment-created-listener';
import { PaymentCreatedEvent } from '../../../common/events/payment-created-event';
import { Order, OrderStatus } from '../../../models/order';

const setup = async () => {
  const EXPIRATION_WINDOW_SECONDS = 15 * 60;
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

  const listener = new PaymentCreatedListener(natsWrapper.client);

  const ticket = await global.createTicket();

  const order = Order.build({
    userId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: expiration,
    ticket
  });
  await order.save();

  const data: PaymentCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    orderId: order.id,
    stripeId: 'stripeId',
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, ticket, order, data, msg };
}


it('update order status to completed', async () => {
  const { listener, ticket, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Completed);
})

it('ack the message', async () => {
  const { listener, ticket, order, data, msg } = await setup();

  // call onMessage function with data and message object
  await listener.onMessage(data, msg);

  // write assertion to make ack is called
  expect(msg.ack).toHaveBeenCalled();
})

it('emit order completed event with correct orderId', async () => {
  const { listener, ticket, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const publishedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  expect(publishedData.id).toEqual(order.id);
})
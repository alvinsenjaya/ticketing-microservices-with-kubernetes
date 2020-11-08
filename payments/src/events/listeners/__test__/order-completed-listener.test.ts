import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { natsWrapper } from '../../../nats-wrapper';
import { OrderCompletedListener } from '../order-completed-listener';
import { OrderCompletedEvent } from '../../../common/events/order-completed-event';
import { Order } from '../../../models/order';
import { OrderStatus } from '../../../common/types/order-status';

const setup = async () => {
  // create instance of listener
  const listener = new OrderCompletedListener(natsWrapper.client);

  // create and save ticket
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.Created,
    userId: mongoose.Types.ObjectId().toHexString()
  })

  await order.save();

  // create fake data event
  const data: OrderCompletedEvent['data'] = {
    id: order.id,
    __v: 1,
    ticket: {
      id: mongoose.Types.ObjectId().toHexString(),
    }
  };

  // create fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { order, listener, data, msg };
}

it('throw error if order is not found', async (done) => {
  const { order, listener, data, msg } = await setup();

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
  const { order, listener, data, msg } = await setup();
  data.__v = data.__v + 100;

  // call onMessage function with data and message object
  try{
    await listener.onMessage(data, msg);
  } catch(err){

  }
  
  // write assertion to make ack is called
  expect(msg.ack).not.toHaveBeenCalled();
})

it('update status on cancel order', async () => {
  const { order, listener, data, msg } = await setup();

  // call onMessage function with data and message object
  await listener.onMessage(data, msg);

  // write assertion to make sure ticket is created
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Completed);
})

it('increment version by 1', async () => {
  const { order, listener, data, msg } = await setup();

  // call onMessage function with data and message object
  await listener.onMessage(data, msg);

  // write assertion to make sure ticket is created
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.__v).toEqual(data.__v);
})


it('ack the message', async () => {
  const { order, listener, data, msg } = await setup();

  // call onMessage function with data and message object
  await listener.onMessage(data, msg);

  // write assertion to make ack is called
  expect(msg.ack).toHaveBeenCalled();
})
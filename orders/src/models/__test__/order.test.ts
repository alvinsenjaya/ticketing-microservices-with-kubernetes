import mongoose from 'mongoose'
import { Order, OrderStatus } from '../order';

it('implements optimistic concurrency control', async (done) => {
  // Create instance of ticket and save to database
  const ticket = await global.createTicket();

  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + 15*60);

  const order = Order.build({
    userId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: expiration,
    ticket
  })

  await order.save()

  // Fetch ticket twice separately
  const firstOrder = await Order.findById(order.id);
  const secondOrder = await Order.findById(order.id);

  // Update ticket twice separately
  firstOrder!.set({
    status: OrderStatus.Cancelled
  })

  secondOrder!.set({
    status: OrderStatus.Cancelled
  })

  // Save first fetched ticket
  await firstOrder!.save()

  // Save second fethced ticket, expect error
  try {
    await secondOrder!.save();
  } catch(err) {
    return done();
  }
  
  throw new Error('Should not reach this point');
});

it('increment version number on multiple save', async () => {
  const ticket = await global.createTicket();

  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + 15*60);

  const order = Order.build({
    userId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: expiration,
    ticket
  })

  await order.save()
  expect(order.__v).toEqual(0);

  order.set({
    status: OrderStatus.Cancelled
  })

  await order.save()
  expect(order.__v).toEqual(1);

  order.set({
    status: OrderStatus.AwaitingPayment
  })

  await order.save()
  expect(order.__v).toEqual(2);
});

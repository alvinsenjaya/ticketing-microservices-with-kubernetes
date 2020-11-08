import request from 'supertest';
import { app } from '../../app';

import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';
import { natsWrapper } from '../../nats-wrapper';

it('has route handler for post request at /api/payments/', async () => {
  const response = await request(app)
    .post('/api/payments/')
    .send({});
  
  expect(response.status).not.toEqual(404);
})

it('return status 401 if user is not authenticated', async () => {
  return request(app)
    .post('/api/payments/')
    .send({})
    .expect(401);
});

it('return status not 401 if user is authenticated', async () => {
  const response = await request(app)
    .post('/api/payments/')
    .set('Cookie', global.signin())
    .send({});
  
  expect(response.status).not.toEqual(401);
});

it('return error if user is authenticated, invalid orderId or token provided', async () => {
  await request(app)
    .post('/api/payments/')
    .set('Cookie', global.signin())
    .send({})
    .expect(400);

  await request(app)
    .post('/api/payments/')
    .set('Cookie', global.signin())
    .send({
      orderId: '',
      token: '',
    })
    .expect(400);
  
  await request(app)
    .post('/api/payments/')
    .set('Cookie', global.signin())
    .send({
      orderId: 'thisisinvalidticketid',
      token: 'thisisinvalidtoken'
    })
    .expect(400);
});

it('return error if user is authenticated, orderId is valid but not found', async () => {
  await request(app)
    .post('/api/payments/')
    .set('Cookie', global.signin())
    .send({
      orderId: mongoose.Types.ObjectId().toHexString(),
      token: 'tok_visa'
    })
    .expect(404);
});

it('return status 401 on create payment for different user', async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10
  })

  await order.save();

  await request(app)
    .post('/api/payments/')
    .set('Cookie', global.signin())
    .send({
      orderId: order.id,
      token: 'tok_visa'
    })
    .expect(401);
});

it('return status 400 on create payment to cancelled order', async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: '5f963b5b27137f0a359c034d',
    status: OrderStatus.Cancelled,
    price: 10
  })

  await order.save();

  await request(app)
    .post('/api/payments/')
    .set('Cookie', global.signin())
    .send({
      orderId: order.id,
      token: 'tok_visa'
    })
    .expect(400);
});

it('return status 201 on successful payment creation', async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: '5f963b5b27137f0a359c034d',
    status: OrderStatus.Created,
    price: Math.floor(Math.random() * 10000)
  })

  await order.save();

  const response = await request(app)
    .post('/api/payments/')
    .set('Cookie', global.signin())
    .send({
      orderId: order.id,
      token: 'tok_visa'
    })
    .expect(201);

  

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find(charge => {
    return charge.amount === order.price * 100
  })

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('usd');

  const payment = await Payment.findOne({ orderId: order.id, stripeId: stripeCharge!.id });
  expect(payment).not.toBeNull();
  expect(response.body.id).toEqual(payment!.id)
});

it('publishes an event after order created', async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: '5f963b5b27137f0a359c034d',
    status: OrderStatus.Created,
    price: Math.floor(Math.random() * 10000)
  })

  await order.save();

  await request(app)
    .post('/api/payments/')
    .set('Cookie', global.signin())
    .send({
      orderId: order.id,
      token: 'tok_visa'
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';

import { natsWrapper } from '../../nats-wrapper';
import { Order, OrderStatus } from '../../models/order';

const createOrder = async () => {
  const ticket = await global.createTicket()

  const response = await request(app)
    .post('/api/orders/')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id
    })
    .expect(201);

  return response;
}

it('return status 401 if user is not authenticated', async () => {
  return request(app)
    .delete('/api/orders/cancel')
    .send()
    .expect(401);
});

it('return status not 401 if user is authenticated', async () => {
  const response = await request(app)
    .post('/api/orders/cancel')
    .set('Cookie', global.signin())
    .send({});
  
  expect(response.status).not.toEqual(401);
});

it('return error if user is authenticated, invalid orderId provided', async () => {
  await request(app)
    .post('/api/orders/cancel/thisisinvalidorderid')
    .set('Cookie', global.signin())
    .send({})
    .expect(400);
});

it('return error if user is authenticated, orderId is valid but not found', async () => {
  await request(app)
    .post(`/api/orders/cancel/${mongoose.Types.ObjectId().toHexString()}`)
    .set('Cookie', global.signin())
    .send({})
    .expect(404);
});

it('return status 200 on successful order cancellation', async () => {
  const response = await createOrder();

  const responseCancel = await request(app)
    .post(`/api/orders/cancel/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({})
    .expect(200);
});

it('return order with status cancelled after successful order cancellation', async () => {
  const response = await createOrder();

  const responseCancel = await request(app)
    .post(`/api/orders/cancel/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({})
    .expect(200);

  expect(responseCancel.body.status).toEqual(OrderStatus.Cancelled);

  const updatedOrder = await Order.findById(response.body.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('publishes an event after order cancelled', async () => {
  const response = await createOrder();

  const responseCancel = await request(app)
    .post(`/api/orders/cancel/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({})
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
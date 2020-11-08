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
    .delete(`/api/orders/${mongoose.Types.ObjectId().toHexString()}`)
    .send()
    .expect(401);
});

it('return status 400 if user is authenticated, order id is invalid', async () => {
  const response = await request(app)
    .delete('/api/orders/thisisinvalidid')
    .set('Cookie', global.signin())
    .send();
  
  expect(response.status).toEqual(400);
})

it('return status 404 if order id is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app)
    .delete(`/api/orders/${id}`)
    .set('Cookie', global.signin())
    .send();
  
  expect(response.status).toEqual(404);
})

it('return status 400 if delete order with status not cancelled', async () => {
  const response = await createOrder();

  await request(app)
    .delete(`/api/orders/${response.body.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(400);
})

it('return status 204 if ticket delete success', async () => {
  const response = await createOrder();

  const order = await Order.findById(response.body.id);
  order!.set({
    status: OrderStatus.Cancelled
  });
  await order!.save();

  const beforeDeletedResponse = await request(app)
    .get('/api/orders/')
    .set('Cookie', global.signin())
    .send({})
    .expect(200);
  
  expect(beforeDeletedResponse.body.length).toEqual(1);

  await request(app)
    .delete(`/api/orders/${response.body.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(204);
  
  const afterDeletedResponse = await request(app)
    .get('/api/orders/')
    .set('Cookie', global.signin())
    .send({})
    .expect(200);
  
  expect(afterDeletedResponse.body.length).toEqual(0);
})

it('publishes an event after order deleted', async () => {
  const response = await createOrder();

  const order = await Order.findById(response.body.id);
  order!.set({
    status: OrderStatus.Cancelled
  });
  await order!.save();

  await request(app)
    .delete(`/api/orders/${response.body.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
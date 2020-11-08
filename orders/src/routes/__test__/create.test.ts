import request from 'supertest';
import { app } from '../../app';

import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('has route handler for post request at /api/orders/', async () => {
  const response = await request(app)
    .post('/api/orders/')
    .send({});
  
  expect(response.status).not.toEqual(404);
})

it('return status 401 if user is not authenticated', async () => {
  return request(app)
    .post('/api/orders/')
    .send({})
    .expect(401);
});

it('return status not 401 if user is authenticated', async () => {
  const response = await request(app)
    .post('/api/orders/')
    .set('Cookie', global.signin())
    .send({});
  
  expect(response.status).not.toEqual(401);
});

it('return error if user is authenticated, invalid ticketId provided', async () => {
  await request(app)
    .post('/api/orders/')
    .set('Cookie', global.signin())
    .send({
      ticketId: '',
    })
    .expect(400);
  
  await request(app)
    .post('/api/orders/')
    .set('Cookie', global.signin())
    .send({
      ticketId: 'thisisinvalidticketid'
    })
    .expect(400);
});

it('return error if user is authenticated, ticketId is valid but not found', async () => {
  await request(app)
    .post('/api/orders/')
    .set('Cookie', global.signin())
    .send({
      ticketId: mongoose.Types.ObjectId().toHexString()
    })
    .expect(404);
});

it('return error if user is authenticated, but purchase own ticket', async () => {
  const ticket = await global.createTicket()

  await request(app)
    .post('/api/orders/')
    .set('Cookie', global.signinDiffUser())
    .send({
      ticketId: ticket.id
    })
    .expect(400);
});

it('return status 201 on successful order creation', async () => {
  const ticket = await global.createTicket()

  await request(app)
    .post('/api/orders/')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id
    })
    .expect(201);
});

it('return status 400 on create order to already reserved ticket', async () => {
  const ticket = await global.createTicket()

  await request(app)
    .post('/api/orders/')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id
    })
    .expect(201);

  await request(app)
    .post('/api/orders/')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id
    })
    .expect(400);
});

it('publishes an event after order created', async () => {
  const ticket = await global.createTicket()

  await request(app)
    .post('/api/orders/')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
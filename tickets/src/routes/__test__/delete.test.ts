import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';

import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('return status 401 if user is not authenticated', async () => {
  return request(app)
    .delete(`/api/tickets/${mongoose.Types.ObjectId().toHexString()}`)
    .send()
    .expect(401);
});

it('return status 400 if user is authenticated, ticket id is invalid', async () => {
  const response = await request(app)
    .delete('/api/tickets/thisisinvalidid')
    .set('Cookie', global.signin())
    .send();
  
  expect(response.status).toEqual(400);
})

it('return status 404 if ticket id is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app)
    .delete(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send();
  
  expect(response.status).toEqual(404);
})

it('return status 401 if user not own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: 10
    })
    .expect(201);

  await request(app)
    .delete(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signinDiffUser())
    .send()
    .expect(401);
})

it('return status 200 with updated ticket if ticket delete success', async () => {
  const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: 10
    })
    .expect(201);

  const beforeDeletedResponse = await request(app)
    .get('/api/tickets/')
    .send({})
    .expect(200);
  
  expect(beforeDeletedResponse.body.length).toEqual(1);

  await request(app)
    .delete(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(200);
  
  const afterDeletedResponse = await request(app)
    .get('/api/tickets/')
    .send({})
    .expect(200);
  
  expect(afterDeletedResponse.body.length).toEqual(0);
})

it('publishes an event after ticket deleted successfully', async() => {
  const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: 10
    })
    .expect(201);

  await request(app)
    .delete(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('return status of 400 if ticket is reserved', async () => {
  const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: 10
    })
    .expect(201);

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({
    orderId: mongoose.Types.ObjectId().toHexString()
  });
  await ticket!.save();

  await request(app)
    .delete(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(400);
})
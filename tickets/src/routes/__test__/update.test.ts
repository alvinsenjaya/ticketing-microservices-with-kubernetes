import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';

import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

const newTitle = 'new title';
const newPrice = 20;
const oldTitle = 'old title';
const oldPrice = 10;

it('return status 401 if user is not authenticated', async () => {
  return request(app)
    .put(`/api/tickets/${mongoose.Types.ObjectId().toHexString()}`)
    .send({ title: newTitle, price: newPrice })
    .expect(401);
});

it('return status 400 if user is authenticated, ticket id is invalid', async () => {
  const response = await request(app)
    .put('/api/tickets/thisisinvalidid')
    .set('Cookie', global.signin())
    .send({ title: newTitle, price: newPrice });
  
  expect(response.status).toEqual(400);
})

it('return error if user is authenticated, invalid title provided', async () => {
  await request(app)
    .put(`/api/tickets/${mongoose.Types.ObjectId().toHexString()}`)
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: newPrice
    })
    .expect(400);
  
  await request(app)
    .put(`/api/tickets/${mongoose.Types.ObjectId().toHexString()}`)
    .set('Cookie', global.signin())
    .send({
      price: newPrice
    })
    .expect(400);
  
});

it('return error if user is authenticated, invalid price provided', async () => {
  await request(app)
    .put(`/api/tickets/${mongoose.Types.ObjectId().toHexString()}`)
    .set('Cookie', global.signin())
    .send({
      title: newTitle,
      price: ''
    })
    .expect(400);
  
  await request(app)
    .put(`/api/tickets/${mongoose.Types.ObjectId().toHexString()}`)
    .set('Cookie', global.signin())
    .send({
      title: newTitle,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${mongoose.Types.ObjectId().toHexString()}`)
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: -20
    })
    .expect(400);
});

it('return status 404 if ticket id is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({ title: newTitle, price: newPrice });
  
  expect(response.status).toEqual(404);
})

it('return status 401 if user not own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      title: oldTitle,
      price: oldPrice
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signinDiffUser())
    .send({ title: newTitle, price: newPrice })
    .expect(401);
})

it('return status 200 with updated ticket if ticket update success', async () => {
  const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      title: oldTitle,
      price: oldPrice
    })
    .expect(201);

  const responseUpdate = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({ title: newTitle, price: newPrice })
    .expect(200);

  expect(responseUpdate.body.title).toEqual(newTitle);
  expect(responseUpdate.body.price).toEqual(newPrice);
})

it('publishes an event after ticket update success', async () => {
  const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      title: oldTitle,
      price: oldPrice
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({ title: newTitle, price: newPrice })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
})

it('return status of 400 if ticket is reserved', async () => {
  const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      title: oldTitle,
      price: oldPrice
    })
    .expect(201);

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({
    orderId: mongoose.Types.ObjectId().toHexString()
  });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({ title: newTitle, price: newPrice })
    .expect(400);
})
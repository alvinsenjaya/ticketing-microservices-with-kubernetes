import request from 'supertest';
import { Ticket } from '../../models/ticket';
import { app } from '../../app';

import { natsWrapper } from '../../nats-wrapper';

it('has route handler for post request at /api/tickets/', async () => {
  const response = await request(app)
    .post('/api/tickets/')
    .send({});
  
  expect(response.status).not.toEqual(404);
})

it('return status 401 if user is not authenticated', async () => {
  return request(app)
    .post('/api/tickets/')
    .send({})
    .expect(401);
});

it('return status not 401 if user is authenticated', async () => {
  const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({});
  
  expect(response.status).not.toEqual(401);
});

it('return error if user is authenticated, invalid title provided', async () => {
  await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 10
    })
    .expect(400);
  
  await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      price: 10
    })
    .expect(400);
  
});

it('return error if user is authenticated, invalid price provided', async () => {
  await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: ''
    })
    .expect(400);
  
  await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      title: 'title',
    })
    .expect(400);

    await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: -10
    })
    .expect(400);
});

it('return status 201 on successful ticket creation', async () => {
  let ticket = await Ticket.find({});
  expect(ticket.length).toEqual(0);

  const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: 10
    });

  ticket = await Ticket.find({});
  expect(ticket.length).toEqual(1);

  expect(response.status).toEqual(201);
});

it('publishes an event after ticket created', async() => {
  const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: 10
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
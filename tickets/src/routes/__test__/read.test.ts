import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';

const createTicket = async () => {
  return request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: 10
    })
    .expect(201);
}

it('return status 400 if id is invalid', async () => {
  const response = await request(app)
    .get('/api/tickets/thisisinvalidid')
    .send({});
  
  expect(response.status).toEqual(400);
})

it('return status 404 if ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app)
    .get(`/api/tickets/${id}`)
    .send({});
  
  expect(response.status).toEqual(404);
})

it('return ticket if ticket is found', async () => {    
  const title = 'title';
  const price = 10;

  const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', global.signin())
    .send({
      title,
      price
    })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send({})
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
})

it('cant fetch list of tickets that the user doesnt has', async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app)
    .get('/api/tickets/myticket')
    .set('Cookie', global.signinDiffUser())
    .send({})
    .expect(200);
  
  expect(response.body.length).toEqual(0);
})

it('can fetch list of tickets that the user has', async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app)
    .get('/api/tickets/myticket')
    .set('Cookie', global.signin())
    .send({})
    .expect(200);

  expect(response.body.length).toEqual(3);
})

it('can fetch list of tickets', async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app)
    .get('/api/tickets/')
    .send({})
    .expect(200);
  
  expect(response.body.length).toEqual(3);
})
import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';

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

it('has route handler for post request at /api/orders/', async () => {
  const response = await request(app)
    .get('/api/orders/')
    .send({});
  
  expect(response.status).not.toEqual(404);
})

it('return status 401 if user is not authenticated', async () => {
  return request(app)
    .get('/api/orders/')
    .send({})
    .expect(401);
});

it('return status not 401 if user is authenticated', async () => {
  const response = await request(app)
    .get('/api/orders/')
    .set('Cookie', global.signin())
    .send({});
  
  expect(response.status).not.toEqual(401);
});

it('return error if user is authenticated, invalid orderId provided', async () => {
  await request(app)
    .get('/api/orders/thisisinvalidorderid')
    .set('Cookie', global.signin())
    .send({})
    .expect(400);

});

it('return error if user is authenticated, orderId is valid but not found', async () => {
  await request(app)
    .get(`/api/orders/${mongoose.Types.ObjectId().toHexString()}`)
    .set('Cookie', global.signin())
    .send({})
    .expect(404);
});

it('return status 200 on successful get order by ticket owner or order owner', async () => {
  const response = await createOrder();

  await request(app)
    .get(`/api/orders/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({})
    .expect(200);

  await request(app)
    .get(`/api/orders/${response.body.id}`)
    .set('Cookie', global.signinDiffUser())
    .send({})
    .expect(200);
});

it('return status 404 on user access another person order', async () => {
  const response = await createOrder();

  await request(app)
    .get(`/api/orders/${response.body.id}`)
    .set('Cookie', global.signinDiffUser2())
    .send({})
    .expect(404);
});

it('can fetch list of orders', async () => {
  await createOrder();
  await createOrder();
  await createOrder();

  const response = await request(app)
    .get('/api/orders/')
    .set('Cookie', global.signin())
    .send({})
    .expect(200);
  
  expect(response.body.length).toEqual(3);
})
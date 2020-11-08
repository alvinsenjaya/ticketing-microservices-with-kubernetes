import request from 'supertest';

import { app } from '../../app';

it('return status of 201 on successfull signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);
});

it('return status of 400 on invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'e',
      password: 'password'
    })
    .expect(400);
});

it('return status of 400 on invalid password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'p'
    })
    .expect(400);
});

it('return status of 400 on missing email and password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({})
    .expect(400);
});

it('return status of 400 on duplicate email', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);
  
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(400);
});

it('set cookie after successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});
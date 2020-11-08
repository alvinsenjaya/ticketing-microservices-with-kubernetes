import request from 'supertest';

import { app } from '../../app';

it('return status of 200 on successfull signin', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

  return request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(200);
});

it('return set cookie on successfull signin', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
});

it('return status of 400 on invalid signin email or password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

    return request(app)
    .post('/api/users/signin')
    .send({
      email: 'e',
      password: 'p'
    })
    .expect(400);
});

it('return status of 400 on signin email not registered', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

    return request(app)
    .post('/api/users/signin')
    .send({
      email: 'test1@test.com',
      password: 'password'
    })
    .expect(400);
});

it('return status of 400 on signin valid registered email, but incorrect password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

    return request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password1'
    })
    .expect(400);
});
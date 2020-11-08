import mongoose from 'mongoose';

import { app } from './app';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCompletedListener } from './events/listeners/order-completed-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
  if(!process.env.JWT_KEY){
    throw new Error('JWT_KEY must be defined');
  }
  if(!process.env.COOKIE_SIGNING_KEY){
    throw new Error('COOKIE_SIGNING_KEY must be defined');
  }
  if(!process.env.STRIPE_KEY){
    throw new Error('STRIPE_KEY must be defined');
  }
  if(!process.env.NATS_URL){
    throw new Error('NATS_URL must be defined');
  }
  if(!process.env.NATS_CLUSTER_ID){
    throw new Error('NATS_URL must be defined');
  }
  if(!process.env.NATS_CLIENT_ID){
    throw new Error('NATS_URL must be defined');
  }
  if(!process.env.MONGO_URI){
    throw new Error('MONGO_URI must be defined');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    console.log('Connected to database');
  } catch (err) {
    console.log(err);
  }
  
  try {
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL);
    console.log('Connected to nats streaming server');

    natsWrapper.client.on('close', () => {
      console.log('Disconnected to nats streaming server');
      process.exit();
    })

    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();
    new OrderCompletedListener(natsWrapper.client).listen();

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());
  } catch(err) {
    console.log(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000');
  });
};

start();

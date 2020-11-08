import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
  if(!process.env.NATS_URL){
    throw new Error('NATS_URL must be defined');
  }
  if(!process.env.NATS_CLUSTER_ID){
    throw new Error('NATS_URL must be defined');
  }
  if(!process.env.NATS_CLIENT_ID){
    throw new Error('NATS_URL must be defined');
  }
  if(!process.env.REDIS_HOST){
    throw new Error('REDIS_HOST must be defined');
  }
  
  try {
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL);
    console.log('Connected to nats streaming server');

    new OrderCreatedListener(natsWrapper.client).listen();

    natsWrapper.client.on('close', () => {
      console.log('Disconnected to nats streaming server');
      process.exit();
    })
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());
  } catch(err) {
    console.log(err);
  }
};

start();

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[]
      signinDiffUser(): string[]
    }
  }
}

jest.mock('../nats-wrapper');
let mongo: any;

beforeAll(async () => {
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for( let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = () => {
  // email: test@test.com, id: 5f963b5b27137f0a359c034d
  const cookie = 's%3AeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmOTYzYjViMjcxMzdmMGEzNTljMDM0ZCIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlhdCI6MTYwMzY4MTExNX0.k4gqaOcMp2BrvHSaADeJhRh1-uiKtMI4k1FZD88UTdM.Q4bR5vALiDVMEY695kW6UwNQiZHbaHk3LhRCnG83sYg';
  return [`x-auth-token=${cookie}`];
}

global.signinDiffUser = () => {
  // email: test1@test.com, id: 5f96acbccd0d9f0cf903169c
  const cookie = 's%3AeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmOTZhY2JjY2QwZDlmMGNmOTAzMTY5YyIsImVtYWlsIjoidGVzdDFAdGVzdC5jb20iLCJpYXQiOjE2MDM3MTAxNDF9.GRvXizKFWuxacBcKbvxQoOvP0zvzQDIVpj-UXfWbXpo.JuEHBUcOZzWhu4KAD1A4%2FiC7wJjTUKObxPnCO9QrZ8o';
  return [`x-auth-token=${cookie}`];
}

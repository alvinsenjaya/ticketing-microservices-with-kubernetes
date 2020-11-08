import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { errorHandler } from './common/middleware/error-handler';
import { NotFoundError } from './common/errors/not-found-error';
import { CreatePaymentRouter } from './routes/create';

const app = express();
app.set('trust proxy', true)
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser(process.env.COOKIE_SIGNING_KEY!))

app.use(CreatePaymentRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
})

app.use(errorHandler);

export { app };

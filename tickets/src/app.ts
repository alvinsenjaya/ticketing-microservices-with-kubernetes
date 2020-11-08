import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { CreateTicketRouter } from './routes/create';
import { ReadTicketRouter } from './routes/read';
import { UpdateTicketRouter } from './routes/update';
import { DeleteTicketRouter } from './routes/delete';
import { errorHandler } from './common/middleware/error-handler';
import { NotFoundError } from './common/errors/not-found-error';

const app = express();
app.set('trust proxy', true)
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser(process.env.COOKIE_SIGNING_KEY!))

app.use(CreateTicketRouter);
app.use(ReadTicketRouter);
app.use(UpdateTicketRouter);
app.use(DeleteTicketRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
})

app.use(errorHandler);

export { app };

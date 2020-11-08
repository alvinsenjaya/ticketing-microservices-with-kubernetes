import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { currentUserRouter} from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler } from './common/middleware/error-handler';
import { NotFoundError } from './common/errors/not-found-error';

const app = express();
app.set('trust proxy', true)
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser(process.env.COOKIE_SIGNING_KEY!))

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
})

app.use(errorHandler);

export { app };

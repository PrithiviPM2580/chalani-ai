import type { Express } from 'express';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import route from '@/routes';
import cors from 'cors';
import corsOptions from '@/lib/cors';
import { globalErrorHandler } from './middleware/globalErrorHandler';
import passport from '@/lib/passport';

const app: Express = express();

app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));

app.use(cookieParser());

app.use(route);

app.use(passport.initialize());

app.use(globalErrorHandler);
export default app;

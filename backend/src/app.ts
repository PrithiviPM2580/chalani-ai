import type { Express } from 'express';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import route from '@/routes';
import cors from 'cors';
import corsOptions from '@/lib/cors';
import { globalLimiterMiddleware } from './middleware/rateLimiter';

const app: Express = express();

app.use(cors(corsOptions));
app.use(helmet());
app.use(globalLimiterMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));

app.use(cookieParser());

app.use(route);
export default app;

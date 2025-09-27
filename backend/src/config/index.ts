/********************************************\
*  ****************************************  *
*  *  Configuration for the application   *  *
*  ****************************************  *
\********************************************/

import { validate } from '@/lib/validate';
import { envValidationSchema } from '@/validation';
import dotenv from 'dotenv';

dotenv.config();

const env = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL,
};

const config = validate(envValidationSchema, env);

export default config;

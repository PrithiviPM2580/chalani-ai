import mongoose, { ConnectOptions } from 'mongoose';
import logger from '@/lib/logger';
import config from '@/config/envValidation';

const clientOptions: ConnectOptions = {
  dbName: config.DB_NAME,
  appName: config.APP_NAME,
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
  minPoolSize: 1,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
};

let isConnected = false;

export const connectToDatabase = async (): Promise<void> => {
  if (!config.DATABASE_URL) {
    logger.error('DATABASE_URL is not defined in environment variables');
    process.exit(1);
  }

  if (isConnected) return;

  try {
    await mongoose.connect(config.DATABASE_URL, clientOptions);
    isConnected = true;
    logger.info('✅ Connected to database');
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error('❌ Error connecting to database', {
        message: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  if (!isConnected) return;

  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('🛑 Disconnected from database');
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error('❌ Error disconnecting from database', {
        message: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
};

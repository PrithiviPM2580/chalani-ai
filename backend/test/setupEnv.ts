process.env.PORT = '4000';
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'debug';
process.env.CORS_WHITELIST = 'http://localhost:3000';
process.env.DB_NAME = 'test_db';
process.env.APP_NAME = 'my-app';
process.env.DATABASE_URL = 'mongodb://localhost:27017/test_db';
process.env.WHITELIST_ADMIN = 'admin@test.com';
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
process.env.GOOGLE_CALLBACK_URL =
  'http://localhost:3000/api/auth/callback/google';

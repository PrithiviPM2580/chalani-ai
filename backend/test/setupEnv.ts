process.env.PORT = '4000';
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'debug';
process.env.CORS_WHITELIST = 'http://localhost:3000';
process.env.DB_NAME = 'test_db';
process.env.APP_NAME = 'my-app';
process.env.DATABASE_URL = 'mongodb://localhost:27017/test_db';
process.env.WHITELIST_ADMIN = 'admin@test.com';
process.env.JWT_ACCESS_SECRET = 'test-access-secret123456789123456789';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret123456789123456789';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
process.env.GOOGLE_CALLBACK_URL =
  'http://localhost:3000/api/auth/callback/google';
process.env.GMAIL_REFRESH_TOKEN = 'test-gmail-refresh-token';
process.env.JWT_PASSWORD_RESET_SECRET =
  'test-password-reset-secret123456789123456789';
process.env.EMAIL_USER = 'test-email-user@gmail.com';
process.env.CLIENT_URL = 'http://localhost:3000';

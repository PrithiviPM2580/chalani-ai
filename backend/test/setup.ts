import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map(collection => collection.deleteMany({}))
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

const mongoose = require('mongoose');
const config = require('./env');
const logger = require('./logger');

let memoryServer = null;

const connectDB = async () => {
  let uri = config.mongoUri;

  if (uri) {
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      logger.info(`MongoDB Connected to primary database: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      logger.warn({ err: error.message }, 'Primary MONGODB_URI unreachable. Initializing MongoMemoryServer fallback...');
    }
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create({
      instance: { dbName: 'testpilot' },
    });
    uri = memoryServer.getUri();
    const conn = await mongoose.connect(uri);
    logger.info(`MongoMemoryServer Connected successfully at ${uri}`);
    return conn;
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to start MongoMemoryServer.');
    return null;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
  } catch (e) {}
};

module.exports = { connectDB, disconnectDB };

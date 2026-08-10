const app = require('./app');
const config = require('./config/env');
const logger = require('./config/logger');
const { connectDB } = require('./config/db');

const startServer = async () => {
  await connectDB();

  const server = app.listen(config.port, () => {
    logger.info(`TestPilot Server running in ${config.env} mode on port ${config.port}`);
  });

  const handleShutdown = (signal) => {
    logger.info(`Received ${signal}. Shutting down server gracefully...`);
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer();

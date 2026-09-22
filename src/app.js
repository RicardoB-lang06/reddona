const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const donorRoutes = require('./routes/donorRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '100kb' }));
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  app.get('/health', (req, res) => res.json({ status: 'ok', service: 'reddona-api' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/donors', donorRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const donorRoutes = require('./routes/donorRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

function buildCorsOptions() {
  const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0) {
    return {};
  }

  return {
    origin(origin, callback) {
      // Peticiones sin Origin (curl, apps moviles, servidor a servidor) se permiten;
      // solo se restringen los origenes de navegador que no esten en la lista blanca.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origen no permitido por CORS'));
    },
  };
}

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors(buildCorsOptions()));
  app.use(express.json({ limit: '100kb' }));
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  // Las respuestas de esta API contienen datos de sesion/usuario y nunca deben
  // ser cacheadas por navegadores o proxies intermedios.
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  app.get('/health', (req, res) => res.json({ status: 'ok', service: 'reddona-api' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/donors', donorRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;

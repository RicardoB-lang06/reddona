function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Recurso no encontrado' });
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Error interno del servidor' });
}

module.exports = { notFoundHandler, errorHandler };

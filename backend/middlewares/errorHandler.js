const errorHandler = (err, req, res, next) => {
  console.error(`[Erro]: ${err.message}`);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Erro interno no servidor.',
  });
};

module.exports = errorHandler;
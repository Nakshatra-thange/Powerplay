const errorHandler = (err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
  
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${req.method}] ${req.path} →`, err);
    }
  
    res.status(status).json({
      error: true,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  };
  
  module.exports = errorHandler;
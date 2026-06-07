const notFound = (req, res) => {
    res.status(404).json({
      error: true,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  };
  
  module.exports = notFound;
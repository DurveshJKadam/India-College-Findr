const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    success: false,
    message: 'Internal Server Error'
  };

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = 'Validation Error';
    error.details = err.message;
  }

  // Database errors
  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    error.message = 'Database connection failed';
  }

  if (err.code === 'ER_BAD_DB_ERROR') {
    error.message = 'Database not found';
  }

  // Custom errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Default 500 error
  res.status(500).json(error);
};

module.exports = errorHandler;
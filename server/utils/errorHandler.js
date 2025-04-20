class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const errorResponse = (res, error) => {
  console.error('Error:', error);
  
  if (error instanceof ErrorResponse) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message
    });
  }

  // Handle mongoose validation errors
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      error: messages
    });
  }

  // Handle mongoose duplicate key errors
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      error: 'Duplicate field value entered'
    });
  }

  // Default error
  return res.status(500).json({
    success: false,
    error: 'Server Error'
  });
};

export { ErrorResponse, errorResponse }; 
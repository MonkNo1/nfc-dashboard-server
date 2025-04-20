import { errorResponse } from '../utils/errorHandler.js';

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  return errorResponse(res, err);
};

export default errorHandler; 
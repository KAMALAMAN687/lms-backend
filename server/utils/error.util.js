//generic functions for handling error in the whole backend

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
    //this provide enrich error handling
  }
}
export default AppError;

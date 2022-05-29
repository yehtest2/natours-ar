const AppError = require(`./../utils/appError`);

const handleCaseErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = err => {
  // const value = err.message.match(/(["'])(?:\\.|[^\\])*?\1/);
  //   console.log(value);
  const value = err.keyValue.name;
  const message = `Duplication ${value}`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
  // const value = Object.values(err.errors).map(val => val.message);
  const message = `${err}`;
  return new AppError(message, 400);
};
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', 401);
const handleJWTExpireError = () =>
  new AppError('your token has expiref please log in again');
const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stacl: err.stack
    });
  }
  return res.status(err.statusCode).render('error', {
    title: 'Soming wrong!',
    msg: err.message
  });
};
const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // console.error('ERR', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something is wrong'
    });
  }
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Soming wrong!',
      msg: err.message
    });
  } // console.error('ERR', err);
  return res.status(err.statusCode).render('error', {
    title: 'Soming wrong!',
    msg: `pleace try again`
  });
};
module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  //console.log(err.isOperational);
  // console.log(err.name);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // console.log(err);

    let error = { ...err };
    error.message = err.message;
    // console.log(error);
    // const value = err.message.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
    // console.log('<----------->');
    if (err.name === 'CastError') error = handleCaseErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError')
      error = handleValidationErrorDB(err.message);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpireError();
    sendErrorProd(error, req, res);
  }
};

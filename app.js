const express = require('express');
const path = require('path');

const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

// const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const hpp = require('hpp');

const cors = require('cors');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');

const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const userRouter = require('./routes/userRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');

const app = express();
app.set('view engine', 'pug');
app.set('view options', path.join(__dirname), 'views');
// app.use(helmet());
app.use(morgan('dev'));
app.use(
  session({
    secret: process.env.SESSIONKEY,
    name: 'user',
    saveUninitialized: true,
    cookie: { maxAge: 1000000 }
  })
);
/**
 * 確認收款狀況
 */

//限制封包大小
app.use(express.json({ limit: '16kb' }));

app.use(express.urlencoded({ extend: true, limit: '16kb' }));
app.post(
  '/checkmy',
  express.raw({ type: '*/*' }),
  bookingController.webhookCheckout
);

app.use(mongoSanitize());
app.use(xss());
app.use(hpp({ whitelist: ['price'] }));
//預設
app.use(express.static(`${__dirname}/public`));
app.use(cookieParser());
app.use(cors());
app.use(compression());
// const corsOptions = {
//   origin: '*',
//   credentials: true, //access-control-allow-credentials:true
//   optionSuccessStatus: 200
// };
app.post(
  '/webhook-Checkout',
  express.raw({ type: '*/*' }),
  bookingController.webhookCheckout
);
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many request to this ip'
});

app.use('/api', limiter);

app.use('/', viewRouter);
app.use('/api/v1/tours/', tourRouter);
app.use('/api/v1/users/', userRouter);
app.use('/api/v1/review/', reviewRouter);
app.use('/api/v1/bookings/', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server! `, 400));
});
app.use(globalErrorHandler);
module.exports = app;

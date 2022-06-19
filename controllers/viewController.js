const AppError = require('../utils/appError');
const Tour = require('./../model/tourModel');
const Book = require('./../model/bookingModel');
const Review = require('./../model/reviewModel');

const catchAsync = require('./../utils/catchAsync');
const User = require('./../model/userModel');
//渲染首頁
/**
 *獲得所有旅程
 */
exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    tour: 'Fast',
    tours
  });
});
//渲染首頁
/**
 *設置訂購成功
 */
exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  console.log(alert);
  if (alert === 'booking') res.locals.alert = `訂購成功`;
  next();
};
//渲染首頁
/**
 *獲得單獨旅程
 */
exports.getTour = async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });
  if (!tour) {
    return next(new AppError('there is error by you', 404));
  }
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
};
//渲染首頁
/**
 *登入
 */
exports.getLogin = (req, res) => {
  res.status(200).render('login', {
    title: 'log into'
  });
};
//渲染首頁
/**
 *註冊
 */
exports.getSignup = (req, res) => {
  res.status(200).render('singup', {
    title: 'your account'
  });
};
//渲染首頁
/**
 *獲得帳戶資訊
 */
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'your account'
  });
};
//渲染首頁
/**
 *更新帳戶資訊
 */
exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );
  res.status(200).render('account', {
    title: 'your account',
    user: updatedUser
  });
});
//渲染首頁
/**
 *獲得訂購旅程
 */
exports.getMyTours = async (req, res, next) => {
  const bookings = await Book.find({ user: req.user.id });
  console.log(req.user.id);
  console.log(bookings);

  const tourId = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourId } });
  console.log(tours);
  res.status(200).render('overview', {
    title: 'My',
    tours
  });
};
exports.getMyRivews = async (req, res) => {
  console.log(req.user.id);
  const reviews = await Review.find({
    user: '5c8a1dfa2f8fb814b56fa181'
  });
  console.log(reviews);
  res.render('review', {
    title: 'review',
    reviews
  });
};

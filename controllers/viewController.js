const AppError = require('../utils/appError');
const Tour = require('./../model/tourModel');
const Book = require('./../model/bookingModel');

const catchAsync = require('./../utils/catchAsync');
const User = require('./../model/userModel');

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    tour: 'Fast',
    tours
  });
});
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
exports.getLogin = (req, res) => {
  console.log('OK');
  console.log('OK2');

  res.status(200).render('login', {
    title: 'log into'
  });
};
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'your account'
  });
};
exports.updateUserData = catchAsync(async (req, res, next) => {
  console.log(req.body);
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
exports.getMyTours = async (req, res, next) => {
  const bookings = await Book.find({ user: req.user.id });
  const tourId = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourId } });
  res.status(200).render('overview', {
    title: 'My',
    tours
  });
};

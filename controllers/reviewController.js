const Review = require('./../model/reviewModel');
const Book = require('./../model/bookingModel');
const handlerFactory = require('./../controllers/handlerFactory');

exports.set = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.identify = async (req, res, next) => {
  console.log(req.body.user);
  console.log(req.body.tour);
  const review = await Book.findOne({
    user: req.body.user,
    tour: req.body.tour
  });
  console.log(review);
  if (review) return next();
  res.status(200).json({
    status: 'No success'
  });
};

exports.createReview = handlerFactory.createOne(Review);
exports.getAllReviews = handlerFactory.getAll(Review);
exports.updateReview = handlerFactory.updateOne(Review);
exports.deleteReview = handlerFactory.deleteOne(Review);

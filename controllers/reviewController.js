const Review = require('./../model/reviewModel');
const handlerFactory = require('./../controllers/handlerFactory');

exports.set = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createReview = handlerFactory.createOne(Review);
exports.getAllReviews = handlerFactory.getAll(Review);
exports.updateReview = handlerFactory.updateOne(Review);
exports.deleteReview = handlerFactory.deleteOne(Review);

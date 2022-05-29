const mongoose = require('mongoose');
const Tour = require('./../model/tourModel');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review can not be empty']
  },
  rating: {
    type: Number,
    max: 5,
    min: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'only ser can write']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'only user can write']
  }
});

reviewSchema.pre(/^find/, function(next) {
  //   this.populate({
  //       path: 'tour',
  //       select: 'name'
  //   }).populate({
  //     path: 'user',
  //     select: 'name'
  // });
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  console.log(tourId);
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        aveRating: { $avg: '$rating' }
      }
    }
  ]);
  console.log('<===============>');
  console.log('<------------>');
  console.log(stats);
  // await Tour.findByIdAndUpdate(tourId, {
  //   ratingsQuantity: stats[0].nRating,
  //   ratingsAverage: stats[0].aveRating
  // });
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].aveRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 10,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.tour);
});
//設index 唯一
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//在存之間查詢 因之後不能查
//findUpdate is belong with findOneAnd
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  console.log('<===============>');
  console.log('<------ＤＤＤＤＤ------>');
  console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

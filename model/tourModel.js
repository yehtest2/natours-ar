const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./../model/userModel');
// const User = require('./../model/userModel');

// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [3, 'A tour name must have more or equal then 10 characters']
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Nofail']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a price'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'no d'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      required: [true, 'oh! my God'],
      min: [1, 'too low'],
      max: [5, 'too height'],
      set: val => Math.round(val)
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'fate grander order ']
    },
    priceDiscount: {
      type: Number,
      // required: [true, 'have a nice day'],
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'no price({VALUE})'
      }
    },
    summary: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    startLocation: {
      //geojson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        date: Number
      }
    ],
    // guides: Array,
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    secretTour: { type: Boolean, default: false }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});
tourSchema.index({ price: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  if (!this.slug) this.slug = this.name;
  next();
});

// tourSchema.pre('save', async function(next) {
//   const guidesPromise = this.guides.map(async id => await User.findById(id));
//   console.log(guidesPromise[0]);
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });
tourSchema.pre('save', function(next) {
  console.log('OK!');
  next();
});
// tourSchema.post('save', function(doc, next) {
//   console.log(doc.name);
//   next();
// });

tourSchema.pre(/^find/, function(next) {
  // console.log(doc.name);
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.pre(/^find/, function(next) {
  // console.log(doc.name);
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});
tourSchema.post(/^find/, function(docs, next) {
  console.log('<-------->');
  console.log(`${Date.now() - this.start}`);
  // console.log(docs);

  next();
});

// tourSchema.pre('aggregate', function(next) {
//   // console.log(doc.name);
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });
// console.log(tourSchema);
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

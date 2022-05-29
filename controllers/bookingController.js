const stripe = require('stripe')(process.env.STRIPE_SEC);
const Tour = require('./../model/tourModel');
const booking = require('./../model/bookingModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const handlerFactory = require('./../controllers/handlerFactory');

exports.getCheckoutSession = async (req, res, next) => {
  console.log(req.params.tourId);

  const tour = await Tour.findById(req.params.tourId);
  const sessions = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'twd',
        quantity: 1
      }
    ]
  });
  res.status(200).json({
    status: 'success',
    sessions
  });
};

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  console.log(user);
  if (!tour && !user && !price) return next();
  await booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
});
exports.getAllUsebooking = handlerFactory.getAll(booking);
exports.getUsebooking = handlerFactory.getOne(booking);
//Do not update passwords with this
exports.updateUsebooking = handlerFactory.updateOne(booking);
exports.deleteUsebooking = handlerFactory.deleteOne(booking);
exports.createUsebooking = handlerFactory.createOne(booking);

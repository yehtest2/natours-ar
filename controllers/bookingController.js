const stripe = require('stripe')(process.env.STRIPE_SEC);
const Tour = require('./../model/tourModel');
const User = require('./../model/userModel');

const booking = require('./../model/bookingModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const handlerFactory = require('./../controllers/handlerFactory');
//
exports.getCheckoutSession = async (req, res, next) => {
  console.log(req.params.tourId);

  const tour = await Tour.findById(req.params.tourId);
  const sessions = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/mytour?alert=booking`,
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
const createBookingCheckout = async session => {
  const tour = session.client_reference_id;
  console.log(session);
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.display_items[0].amount / 100;
  console.log('kk');
  const a = await booking.create({ tour, user, price });
  console.log(a);
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns 回傳值,收到與否
 */
exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  const sec = 'whsec_U93U8niQxz0uEly7u5nrWyVh35AJS5Oy';
  console.log('haha');
  console.log(signature);
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, sec);
    console.log(event.data.object);
  } catch (err) {
    return res.status(400).send(`${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    createBookingCheckout(event.data.object);
  }

  console.log('no thing');
  res.status(200).json({ received: true });
};
// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   const { tour, user, price } = req.query;
//   console.log(user);
//   if (!tour && !user && !price) return next();
//   await booking.create({ tour, user, price });
//   res.redirect(req.originalUrl.split('?')[0]);
// });

exports.getAllUsebooking = handlerFactory.getAll(booking);
exports.getUsebooking = handlerFactory.getOne(booking);
//Do not update passwords with this
exports.updateUsebooking = handlerFactory.updateOne(booking);
exports.deleteUsebooking = handlerFactory.deleteOne(booking);
exports.createUsebooking = handlerFactory.createOne(booking);

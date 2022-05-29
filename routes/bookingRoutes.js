const express = require('express');

const bookController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

// const authController = require('./../controllers/authController');

const router = express.Router();
router.use(authController.protect);

router.get('/check-session/:tourId', bookController.getCheckoutSession);
router.use(authController.restricTo('admin'));

router
  .route('/')
  .get(bookController.getAllUsebooking)
  .post(bookController.createUsebooking);

router
  .route('/:id')
  .get(bookController.getUsebooking)
  .patch(bookController.updateUsebooking)
  .delete(bookController.deleteUsebooking);

module.exports = router;

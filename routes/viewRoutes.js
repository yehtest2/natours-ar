const express = require('express');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');
const bookController = require('./../controllers/bookingController');

const router = express.Router();
// router.use(authController.isLoggedIn);
router.get(
  '/',
  bookController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);
router.get('/tours/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLogin);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/mytour', authController.protect, viewController.getMyTours);

router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData
);

module.exports = router;

const express = require('express');

const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

// const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });
router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restricTo('user', 'admin'),
    reviewController.set,
    reviewController.identify,
    reviewController.createReview
  );
router
  .route('/:id')
  .delete(
    authController.restricTo('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authController.restricTo('user', 'admin'),
    reviewController.updateReview
  );
module.exports = router;

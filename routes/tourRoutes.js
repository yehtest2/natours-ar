const express = require('express');

const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRoute = require('./../routes/reviewRoutes');

const router = express.Router();
// router.param('id', tourController.checkId); //only website have id reqs
///tours-within/:distance/center/:latlng/unit/:unit
///tours-within/233/center/-12,33/unit/mi
router.route('/distence/:latlng/unit/:unit').get(tourController.getDistances);
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.use('/:tourId/reviews', reviewRoute);
router
  .route('/tour-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
// tourController.aliasTopTours,
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restricTo('admin', 'lead-guide'),
    tourController.createTour
  );
router.route('/getgroup').get(tourController.getTourstatus);
router
  .route('/monthly/:year')
  .get(
    authController.protect,
    authController.restricTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );
router
  .route('/:id')
  .get(tourController.getTours)
  .patch(
    authController.protect,
    authController.restricTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restricTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restricTo('user'),
//     reviewController.createReview
//   );
module.exports = router;

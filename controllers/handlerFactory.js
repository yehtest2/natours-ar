const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/application');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No tour found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      doc
    });
  });

exports.updateOne = Model =>
  catchAsync(async function(req, res, next) {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return next(new AppError('No  found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      lenght: doc.length,
      data: {
        doc
      }
    });
  });
exports.createOne = Model =>
  catchAsync(async function(req, res, next) {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: doc
    });
  });
exports.getAll = Model =>
  catchAsync(async function(req, res, next) {
    let filer = {};
    if (req.params.tourId) filer = { tour: req.params.tourId };
    const feature = new APIFeatures(Model.find(filer), req.query)
      .filter()
      .sort()
      .fields()
      .page();
    const doc = await feature.query;
    // const doc = await feature.query.explain();

    res.status(200).json({ status: 'ok', length: doc.length, data: { doc } });
  });
exports.getOne = Model =>
  catchAsync(async function(req, res, next) {
    const doc = await Model.findById(req.params.id).populate('reviews');
    if (!doc) {
      return next(new AppError('No doc found with that ID', 404));
    }
    res.status(200).json({
      status: 'ok',
      lenght: doc.length,
      data: {
        doc
      }
    });
  });

const multer = require('multer');
const sharp = require('sharp');

const User = require('./../model/userModel');

// const APIFeatures = require('./../utils/application');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const handlerFactory = require('./../controllers/handlerFactory');
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('New', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
//更新使用者圖像
exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = async (req, res, next) => {
  if (!req.file) {
    console.log('HHHHHHHHH');

    return next();
  }
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  console.log(req.file.filename);
  next();
};
/**
 *
 * @param {*} obj
 * @param  {...any} allowedFelds
 * @returns
 * 過濾物件 確保安全
 */
const filterObj = (obj, ...allowedFelds) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFelds.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 *
 * 得到使用者id
 */
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 *
 * 更新使用者資訊
 */
exports.updateMe = async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError(`OH NOT THIS ROW`, 400));
  }
  console.log(req.file);
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      updatedUser
    }
  });
};
/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 *
 * 刪除使用者
 */
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(200).json({
    status: 'success'
  });
});

exports.getAllUser = handlerFactory.getAll(User);
exports.getUser = handlerFactory.getOne(User);
//Do not update passwords with this
exports.updateUser = handlerFactory.updateOne(User);
exports.deleteUser = handlerFactory.deleteOne(User);
exports.createUser = handlerFactory.createOne(User);

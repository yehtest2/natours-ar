const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('./../model/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const Email = require('./../utils/email');
//創造jwt token
/**
 *
 * @param {*} id
 * @returns     創造jwt token
 */
const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPRES_IN
  });
};

//創造ＪＷＴ token
/**
 *
 * @param {*} user
 * @param {*} statusCode
 * @param {*} res
 * 發送jwt 傳回給token
  根據userid 造jwt
  設定cokie 參數
  設置cookie 保護
  回傳給網頁端
 * 
 */
const createSendToken = (user, statusCode, res) => {
  //根據userid 造jwt
  const token = signToken(user._id);
  //設定cokie 參數
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_IN * 24 * 60 * 60),
    httpOnly: true
  };
  //設置cookie 保護
  if (process.env.NODE_ENV === 'prod') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  console.log(token);
  //回傳給網頁端
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};
/**
  //寫入資料庫
  //轉送url
 * //送信慶祝登入
 * 創token
 */
exports.signup = catchAsync(async (req, res, next) => {
  //寫入資料庫
  console.log(req.body);
  const newUser = await User.create({
    name: req.body.name,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    email: req.body.email,
    role: req.body.role,
    photo: req.body.photo
  });
  //轉送url
  const url = `${req.protocol}://${req.get('host')}/`;
  console.log(url);
  //送信慶祝登入
  await new Email(newUser, url).sendWelcome();
  //創token
  createSendToken(newUser, 200, res);
});

//登入
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1 check email

  if (!email || !password) {
    return next(new AppError('please provide email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');

  //const correct = await user.correctPassword(password, user.password);
  if (
    !user ||
    !(await user.correctPassword(req.body.password, user.password))
  ) {
    return next(new AppError('Incorrect email or password', 400));
  }
  console.log(user._id);

  req.session.user = user._id;

  //送token
  createSendToken(user, 200, res);
});
/**
 * 認證token
 * 保護部分需要認證方可使用
 */
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    console.log(req.headers.authorization);
    token = req.headers.authorization.split(' ')[1];
    console.log(token);
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('Your are not a user OK!', 404));
  }
  //解碼
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //是否是新的使用者
  console.log(decoded);
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('The user beloning to this token does no longer exist', 401)
    );
  }
  //近期改變密碼
  if (freshUser.changePasswordAfter(decoded.iat)) {
    return next(new AppError('User recently change'), 401);
  }
  //設置user
  req.user = freshUser;

  res.locals.user = freshUser;

  next();
});
//是否登入
/**
 * 是否登入
 */
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //解碼
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      //check change
      if (currentUser.changePasswordAfter(decoded.iat)) {
        return next();
      }
      console.log(currentUser);
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }

  next();
});
//登出
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedour', {
    expires: new Date(Date.now() + 15 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};
//驗證身分路由
exports.restricTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('YOU do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

//忘記密碼
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //check user
  const user = await User.findOne({ email: req.body.email });
  console.log(user);
  if (!user) {
    return next(new AppError('There is no user with email address', 404));
    //generate the random reset token
  }
  //設置網頁token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3

  try {
    // await Email({
    //   email: user.email,
    //   subject: 'your password reset yoken (valid for 10 min)',
    //   message
    // });
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    console.log(resetURL);

    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.createPasswordResetToken = undefined;
    user.createPasswordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('there was an error sendind the email. Try again later', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expaired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});
/**
 * 更新密碼
 *
 */
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1選擇
  const user = await User.findById(req.user.id).select('+password');
  //2
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('this login is not '), 401);
  }

  //3
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 200, res);
});

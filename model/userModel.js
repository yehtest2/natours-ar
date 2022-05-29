const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'hey boy no name in there']
  },
  email: {
    type: String,
    required: [true, 'no email in there'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'OH OH']
  },
  photo: {
    type: String,
    default: 'default.jpg'
    // required: [true, 'no photo']
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'no photo'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    require: [true, 'please confirm your password'],
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'same'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  console.log('<===============>');
  next();
});
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  //加密
  this.password = await bcrypt.hash(this.password, 13);
  //存驗證密碼正確性
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();

  this.passwordChangedAt = Date.now() - 2000;
  next();
});
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    console.log(this.passwordChangedAt, JWTTimestamp);
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 600 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;

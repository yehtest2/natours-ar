const mongoose = require('mongoose');
const fs = require('fs');

const dotenv = require('dotenv');
const Tour = require('./../../model/tourModel');
const User = require('./../../model/userModel');
const Review = require('./../../model/reviewModel');

dotenv.config({ path: './config.env' });
// console.log(process.env.DATA_PASSWORD);
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATA_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users);
    await Review.create(reviews);
    console.log('success');
  } catch (err) {
console.log(err);
  }
  process.exit();
};
const DeleteData = async () => {
  try {
    await User.deleteMany();
    await Tour.deleteMany();
    await Review.deleteMany();
    console.log('success');
  } catch (err) {
console.log(err.message);
  }
  process.exit();
};

const DeleteUserData = async () => {
  try {
    await User.deleteMany();
    await Tour.deleteMany();
    await Review.deleteMany();
    console.log('success');
  } catch (err) {
   console.log(err.message);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  DeleteData();
} else {
  DeleteUserData();
}

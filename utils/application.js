class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    // queryObj.price = 34;
    //過濾
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);
    console.log(queryObj);
    // const query = Tour.find(queryObj);
    // console.log(req.query);
    // console.log(queryObj);
    // const a = Tour.find({ price: 397 });
    // eslint-disable-next-line no-unused-vars
    let queryStr = JSON.stringify(queryObj);
    //高階過濾
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
    // console.log(JSON.parse(queryStr));
    // let query = Tour.find(JSON.parse(queryStr));
    // console.log(query);
    // console.log('<--------->');
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split('.').join(' ');
      // console.log(sortBy);
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  fields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  page() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    // console.log(this.query);
    if (this.queryString.page) {
      // const numberpage = this.query.countDocuments();
      // console.log(numberpage);
      if (skip < 0) throw new Error('this page  not exit');
    }
    return this;
  }
}
module.exports = APIFeatures;

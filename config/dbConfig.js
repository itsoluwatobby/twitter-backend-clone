const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');

const dbConfig = asyncHandler( async() => {
   await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true, useUnifiedTopology: true
   })
})

module.exports = dbConfig;

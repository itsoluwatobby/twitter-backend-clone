const mongoose = require('mongoose');

const sharedPostSchema = new mongoose.Schema(
   {
      sharerId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
      sharedDate: { type: String, required: true, default: '' },
      sharedPost: { type: Object, required: true, default: {} },
   },
   {minimize: false},
   {timestamps: true}
)

module.exports = mongoose.model('sharePosts', sharedPostSchema);

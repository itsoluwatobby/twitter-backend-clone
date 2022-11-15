const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
   {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
      postId: { type: mongoose.Schema.Types.ObjectId, ref: 'posts', required: true },
      body: { type: String, required: true },
      commentDate: { type: String, required: true, default: '' },
      thumbsUp: { type: Array, default: [] },
      thumbsUpDown: { type: Array, default: [] },
      edited: { type: Boolean, default: false },
      editDate: { type: String, default: '' }
   },
   {minimize: false},
   {timestamps: true}
)

module.exports = mongoose.model('comments', commentSchema);

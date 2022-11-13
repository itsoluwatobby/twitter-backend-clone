const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
   {
      userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', required: true
      },
      title: { type: String, required: true },
      postDate: { type: String, required: true, default: '' },
      picture: { type: String, required: true },
      body: { type: String, required: true },
      likes: { type: Array, default: [] },
      disLikes: { type: Array, default: [] },
   },
   {minimize: false},
   {timestamps: true}
)

module.exports = mongoose.model('posts', postSchema);

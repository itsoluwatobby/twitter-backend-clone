const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema(
   {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
      commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'comments', required: true },
      body: { type: String, required: true },
      responseDate: { type: String, required: true, default: '' },
      thumbsUp: { type: Array, default: [] },
      thumbsUpDown: { type: Array, default: [] },
   },
   {minimize: false},
   {timestamps: true}
)

module.exports = mongoose.model('responses', responseSchema);

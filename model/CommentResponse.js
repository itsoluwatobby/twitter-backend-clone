const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema(
   {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
      commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'comments', required: true },
      body: { type: String, required: true },
      thumbsUp: { type: Array, default: [] },
      thumbsUpDown: { type: Array, default: [] },
      responseDate: { type: String, default: '' },
      edited: { type: Boolean, default: false },
      editDate: { type: String, default: '' }
   },
   {minimize: false},
   {timestamps: true}
)

module.exports = mongoose.model('responses', responseSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
   {
      firstName: { type: String, required: true, min: 3 },
      lastName: { type: String, required: true, min: 3 },
      email: { type: String, required: true, unique: true, min: 3 },
      profilePicture: { type: String, default: '' },
      desc: { type: String, default: '' },
      status: { type: String, required: true, default: 'offline' },
      password: { type: String, required: true, min: 3 },
      isAccountActive: { type: Boolean, default: false },
      isAccountLocked: { type: Boolean, default: false },
      roles: { type: Array, default: 'USER' },
      verificationLink: {type: String, default: '' },
      resetPassword: {type: Boolean, default: false },
      refreshToken: { type: String, default: '' },
   },
   {timestamps: true}
)

module.exports = mongoose.model('users', userSchema);


//status: offline, online
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
   {
      firstName: { type: String, required: true, min: 3 },
      lastName: { type: String, required: true, min: 3 },
      email: { type: String, required: true, unique: true, min: 3 },
      profilePicture: { type: String, default: '' },
      desc: { type: String, default: '' },
      dob: { type: String, default: '' },
      status: { type: String, required: true, default: 'offline' },
      password: { type: String, required: true, min: 3 },
      isAccountActive: { type: Boolean, default: false },
      isAccountLocked: { type: Boolean, default: false },
      dateLocked: { type: String, default: '' },
      dateUnLocked: { type: String, default: '' },
      roles: { type: Array, default: 'USER' },
      followers: { type: Array, default: [] },
      following: { type: Array, default: [] },
      country: { type: String, default: '' },
      city: { type: String, default: '' },
      hobbies: { type: Array, default: [] },
      relationShip: { type: String, default: 'Unknown' },
      verificationLink: { type: String, default: '' },
      registrationDate: { type: String, default: '' },
      resetPassword: { type: Boolean, default: false },
      refreshToken: { type: String, default: '' },
      edited: { type: Boolean, default: false },
      editDate: { type: String, default: '' }
   },
   {minimize: false},
   {timestamps: true}
)

module.exports = mongoose.model('users', userSchema);


//status: offline, online
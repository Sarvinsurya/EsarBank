const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String, // Store hashed passwords
  address1: String,
  city: String,
  state: String,
  postalCode: String,
  dateOfBirth: String,

});

const Users = mongoose.model('User', userSchema);

module.exports = Users;

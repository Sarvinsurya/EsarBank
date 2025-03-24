// models/LoginDetails.js
const mongoose = require('mongoose');


const LoginDetailsSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    lastLogin: { type: Date, required: true },
    loginAttempts: { type: Number, default: 0 },
    loginTimes: { type: [Date], default: [] }, // Array to store all login times
});

const LoginDetails = mongoose.model('LoginDetails', LoginDetailsSchema);

module.exports = LoginDetails;

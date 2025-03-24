const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fdSchema = new mongoose.Schema({
  email: {
    type: String, // Reference to User model based on email
    required: true,
    trim: true
  },
  fdId: {
    type: String, // Expect FD ID to be passed manually during creation
    required: true
  },
  principalAmount: {
    type: Number,
    required: true
  },
  tenure: {
    type: Number,  // Tenure in years
    required: true
  },
  depositDate: {
    type: Date,
    required: true,
    default: Date.now  // Defaults to the current date
  },
  maturityDate: {
    type: Date,  // Can be calculated later based on tenure
  },
  maturityAmount: {
    type: Number,  // Can be calculated based on principal and interest rate
  },
  interestRate: { // New field for interest rate
    type: Number,
    required: true // Make it required if necessary
  }
}, { timestamps: true });

const FD = mongoose.model('FD', fdSchema, 'FD');
module.exports = FD;
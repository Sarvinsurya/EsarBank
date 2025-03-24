const mongoose = require('mongoose');

// Function to generate 9-character alphanumeric transactionId
function generateTransactionId() {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyz';
  let transactionId = '';
  for (let i = 0; i < 9; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    transactionId += characters[randomIndex];
  }
  return transactionId;
}

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true },  // Generated 9-character transactionId

  senderAccountNumber: { type: String, required: true },  // Sender's account number
  receiverAccountNumber: { type: String, required: true },  // Receiver's account number
  amount: { type: Number, required: true },
  remarks: { type: String },
  status: { type: String, default: 'Pending' },
  transactionTime: { type: Date, default: Date.now }
});

// Pre-save hook to auto-generate transactionId before saving
transactionSchema.pre('save', function (next) {
  if (!this.transactionId) {
    this.transactionId = generateTransactionId();  // Assigning the generated ID
  }
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;

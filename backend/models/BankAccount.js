const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    IFSC: { type: String, required: true },
    accountNumber: { type: String, required: true },
    customerId: { type: String, required: true },
    email: { type: String, required: true },
    currentBalance: { type: Number, default: 0 },
    accountType: { type: String, default: 'Savings' },
    overdraftLimit: { type: Number, default: 0 },  // Overdraft limit, default is 0 for accounts without overdraft
    panNumber: { type: String,  }, // PAN number field, 
    nomineeName: { type: String, }, // Nominee name, 
    nomineeAge: { type: Number,  }, // Nominee age, 
    nomineeRelation: { type: String, }, // Nominee relation, 
});

const BankAccount = mongoose.model('BankAccount', bankAccountSchema);

module.exports = BankAccount;
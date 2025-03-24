const cron = require('node-cron');
const BankAccount = require('./models/BankAccount');

async function applyMonthlyInterest() {
  try {
    const savingsAccounts = await BankAccount.find({ accountType: 'Savings' });

    for (const account of savingsAccounts) {
      const interestAmount = Math.min(account.currentBalance * 0.02, 100);
      account.currentBalance += interestAmount;
      await account.save();
    }

    console.log('Monthly interest applied to savings accounts.');
  } catch (error) {
    console.error('Error applying monthly interest:', error);
  }
}

module.exports = { applyMonthlyInterest };

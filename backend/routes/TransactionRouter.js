const express = require('express');
const Transaction = require('../models/Transaction');
const BankAccount = require('../models/BankAccount');
const router = express.Router();

// Function to handle money transfer
router.post('/transfer', async (req, res) => {
    const { senderAccountNumber, receiverAccountNumber, email, amount, remarks } = req.body.transferData || {};
    
    console.log(req.body);  // Still log the whole request body for debugging

    // Ensure the required fields are present
    if (!senderAccountNumber || !receiverAccountNumber || !amount || !email) {
        console.log(`if block : ${senderAccountNumber}`);
        return res.status(400).json({ message: 'Sender account number, receiver account number, email, and amount are required.' });
    }

    try {
        // Find sender and receiver accounts using their account numbers and email
        const senderAccount = await BankAccount.findOne({ accountNumber: senderAccountNumber });
        const receiverAccount = await BankAccount.findOne({ email, accountNumber: receiverAccountNumber });

        if (!senderAccount) {
            console.log(`sender block : ${senderAccountNumber} ${receiverAccountNumber} ${amount} ${email}`)

            return res.status(404).json({ message: 'Sender account not found.' });
        }
        if (!receiverAccount) {
            return res.status(404).json({ message: 'Receiver account not found.' });
        }


        // Check if the sender has sufficient balance
        if (senderAccount.currentBalance < amount) {
            console.log(`current balance : ${senderAccountNumber} ${receiverAccountNumber} ${amount} ${email}`)

            return res.status(400).json({ message: 'Insufficient balance.' });
        }

        // Proceed with the transaction
        senderAccount.currentBalance -= amount;
        receiverAccount.currentBalance += amount;

        await senderAccount.save();
        await receiverAccount.save();

        // Log transaction
        const transaction = new Transaction({
            senderAccountNumber: senderAccountNumber,
            receiverAccountNumber: receiverAccountNumber,
            amount,
            remarks,
            status: 'Success', // Update the status to 'Success'
            transactionTime: new Date()  // Automatically sets the current timestamp
        });
        await transaction.save();
        return res.status(200).json({ message: 'Transfer successful.', transaction });
    
    } catch (error) {
        console.error("Transaction Error:", error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});



router.get('/success/:transactionId', async (req, res) => {
    const { transactionId } = req.params;
  
    try {
      // Fetch transaction details by ID
      const transaction = await Transaction.findById(transactionId);
  
      if (!transaction) {
        return res.status(404).send('Transaction not found.');
      }
  
      // Render success page with transaction details
      res.render('transaction-success', {
        transactionId: transaction.transactionId,
        senderAccountNumber: transaction.senderAccountNumber,
        receiverAccountNumber: transaction.receiverAccountNumber,
        amount: transaction.amount,
        remarks: transaction.remarks,
        transactionTime: transaction.transactionTime
      });
    } catch (error) {
      console.error('Error fetching transaction:', error);
      res.status(500).send('Error displaying transaction details.');
    }
  });



// Fetch transaction history (Optional)
router.get('/transactions/:accountNumber', async (req, res) => {
  const { accountNumber } = req.params;

  try {
    // Find transactions where the account is either the sender or receiver
    const transactions = await Transaction.find({
      $or: [
        { senderAccountNumber: accountNumber },
        { receiverAccountNumber: accountNumber }
      ]
    });

    // Add a field 'type' to determine if the transaction is debit or credit
    const processedTransactions = transactions.map(transaction => ({
      ...transaction._doc,
      type: transaction.senderAccountNumber === accountNumber ? 'debit' : 'credit',
    }));

    res.status(200).json({ transactions: processedTransactions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error });
  }
});

router.get('/accounts/:customerId', async (req, res) => {
    try {
      const { customerId } = req.params;
      const accounts = await BankAccount.find({ customerId: customerId });
      return res.status(200).json(accounts);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  });


  
// New route to check if account exists
router.get('/checkAccount', async (req, res) => {
    const { accountNumber, email } = req.query;

    if (!accountNumber || !email) {
        return res.status(400).json({ message: 'Account number and email are required.' });
    }

    const accountExists = await BankAccount.findOne({ email, accountNumber });
    
    return res.json({ exists: !!accountExists });
});

// Fetch accounts associated with a given email
router.get('/accountsByEmail', async (req, res) => {
  const { email } = req.query;

  try {
    const accounts = await BankAccount.find({ email });
    if (!accounts.length) {
      return res.status(404).json({ message: 'No accounts found for this email.' });
    }
    return res.status(200).json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return res.status(500).json({ message: 'Server error while fetching accounts.' });
  }
});


module.exports = router;

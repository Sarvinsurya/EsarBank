const express = require('express');
const FD = require('../models/Deposit');
const router = express.Router();
const BankAccount = require('../models/BankAccount'); // Correct the path if necessary

// Endpoint to fetch fixed deposits by user email
router.post('/fds', async (req, res) => {
  const { email } = req.body; // Expecting the email to be passed in the request body

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    console.log("email: ", email);
    const fds = await FD.find({ email }); // Query the database for FDs matching the user email
    console.log(fds);
    return res.json(fds);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});



function calculateMaturityAmount(principal, interestRate, tenure) {
    const amount = principal * Math.pow((1 + (interestRate / 100)), tenure);
    return parseFloat(amount.toFixed(2)); // Round to two decimal places
  }

// Helper function to determine interest rate based on tenure
function getInterestRate(tenure) {
  if (tenure <= 5) {
    return 5.0; // Interest rate for tenures <= 5 years
  } else if (tenure <= 10) {
    return 6.5; // Interest rate for tenures between 5 and 10 years
  } else {
    return 7.5; // Interest rate for tenures > 10 years
  }
}
function generateFDID() {
  const prefix = "27191";
  const randomDigits = Math.floor(10000 + Math.random() * 90000); // Generates a 5-digit random number
  return prefix + randomDigits;
}


// Route to handle FD deposit request
router.post('/deposit', async (req, res) => {
  try {
    const { emailId, principalAmount, tenure } = req.body;
    console.log(emailId)

    if (!emailId || !principalAmount || !tenure) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Step 1: Check the user's savings account balance
    const savingsAccount = await BankAccount.findOne({ email : emailId, accountType: 'Savings' });
    console.log(savingsAccount)
    if (!savingsAccount) {
      return res.status(404).json({ message: 'Savings account not found' });
    }

    // Step 2: Check if the account has sufficient balance
    if (savingsAccount.currentBalance < principalAmount) {
      return res.status(400).json({ message: 'Insufficient balance in savings account' });
    }

    // Step 3: Calculate other necessary attributes
    const interestRate = getInterestRate(tenure);  // Get the interest rate based on tenure
    const depositDate = new Date();  // Default to current date
    const maturityDate = new Date(depositDate);  // Clone the deposit date
    maturityDate.setFullYear(maturityDate.getFullYear() + tenure);  // Add tenure years

    // Calculate the maturity amount using compound interest
    const maturityAmount = calculateMaturityAmount(principalAmount, interestRate, tenure);
    const fd_id  = generateFDID();
    // Step 4: Create a new FD record
    const newFD = new FD({
      fdId:fd_id,
      email: emailId,
      principalAmount,
      tenure,
      depositDate,
      maturityDate,
      maturityAmount,
      interestRate
    });

    // Step 5: Save the FD record to the database
    await newFD.save();

    // Step 6: Deduct the principal amount from the savings account balance
    savingsAccount.currentBalance -= principalAmount; // Deduct the FD amount
    await savingsAccount.save(); // Save the updated account balance

    // Return a success response
    return res.status(200).json({ message: 'FD created successfully', fd: newFD });

  } catch (error) {
    console.error('Error creating FD:', error);
    return res.status(500).json({ message: 'Error creating FD', error });
  }
});

// Function to withdraw from FD
router.post('/withdraw', async (req, res) => {
  const { fdId } = req.body; // Only fdId is passed in the request

  try {
    // Find the FD by its ID
    const fd = await FD.findOne({ fdId });
    if (!fd) {
      return res.status(404).json({ message: 'FD not found.' });
    }

    const currentDate = new Date();
    const maturityDate = new Date(fd.maturityDate);

    // Find the user's savings account based on the FD's email
    const userAccount = await BankAccount.findOne({ email: fd.email, accountType: 'Savings' });
    if (!userAccount) {
      return res.status(404).json({ message: 'User savings account not found.' });
    }

    let amountToAdd;

    if (currentDate >= maturityDate) {
      // If the maturity date has passed, add full maturity amount
      amountToAdd = fd.maturityAmount;
    } else {
      // If the maturity date has not passed, reduce interest rate by 0.2% and calculate interest till date
      const reducedInterestRate = fd.interestRate - 0.2;

      // Calculate tenure up to the current date in years
      const tenureInYears = (currentDate - new Date(fd.depositDate)) / (1000 * 60 * 60 * 24 * 365);

      // Calculate interest till date with reduced interest rate
      const interestTillDate = (fd.principalAmount * reducedInterestRate / 100) * tenureInYears;
      amountToAdd = fd.principalAmount + interestTillDate;
    }

    // Update the user's savings account balance
    userAccount.currentBalance += amountToAdd;
    await userAccount.save(); // Save the updated bank account balance

    // Remove the FD record after successful withdrawal
    await FD.findOneAndDelete({ fdId });

    res.status(200).json({ message: 'Withdrawal successful', amountAdded: amountToAdd });
  } catch (error) {
    console.error('Error during withdrawal:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;




module.exports = router;
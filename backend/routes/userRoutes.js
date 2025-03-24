
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BankAccount = require('../models/BankAccount'); // BankAccount model for storing account details
const router = express.Router();
const LoginDetails =require('../models/LoginDetails');


// Secret key for JWT (replace this with your secret)
const JWT_SECRET = "5f4dcc3b5aa765d61d8327deb882cf99"; // Replace with your actual secret key

// Sign Up Route (User Registration)
router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password, address1, city, state, postalCode, dateOfBirth, aadhar } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword, // Store hashed password
            address1,
            city,
            state,
            postalCode,
            dateOfBirth,
            aadhar
        });

        // Save user in the database
        console.log("user saved in db");
        await newUser.save();

        // Generate account details to show to the user
        const accountDetails = generateAccountDetails(city, email);

        res.status(201).json({ message: 'User registered successfully', accountDetails, userId: newUser._id });
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// Sign In Route (User Login)
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // Generate JWT token
        const token = jwt.sign(
          { 
            
            userId: user._id, 
            firstName: user.firstName, 
            lastName: user.lastName, 
            email: user.email ,
            
          }, 
          JWT_SECRET, 
          { expiresIn: '1h' }
        );

        const currentTime = new Date();

        const loginDetail = await LoginDetails.findOne({ email: user.email });

        if (loginDetail) {
            // If a record exists, set lastLogin to the latest time from loginTimes
            const lastLoginTime = loginDetail.loginTimes[loginDetail.loginTimes.length - 1] || null; // Get the latest login time from the array
        
            await LoginDetails.findOneAndUpdate(
                { email: user.email },
                {
                    lastLogin: lastLoginTime, // Use the retrieved last login time
                    $inc: { loginAttempts: 1 }, // Increment loginAttempts
                    $push: { loginTimes: currentTime }, // Add the current time to loginTimes array
                },
                { upsert: true } // Create a new record if it doesn't exist
            );
        } else {
            // If no record exists, create a new one with the current time
            await LoginDetails.create({
                email: user.email,
                lastLogin: currentTime,
                loginAttempts: 1,
                loginTimes: [currentTime],
            });
        }
        res.status(200).json({ message: 'Sign in successful', token });
    } catch (error) {
        console.error('Error during sign in:', error);
        res.status(500).json({ message: 'Server error during sign in.' });
    }
});

// Confirm Account Route (Bank Account Creation)
router.post('/confirm-account', async (req, res) => {
    const { userId, accountDetails } = req.body;

    try {
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
          console.log("called confirm");

            return res.status(404).json({ message: 'User not found.' });
        }

        // Create the bank account
        const newAccount = new BankAccount({
            userId:user._id,
            IFSC: accountDetails.IFSC,
            accountNumber: accountDetails.accountNumber,
            customerId: accountDetails.customerId,
            email: user.email,
            currentBalance: 0,
            accountType: 'Savings'
        });

        // Save account to database
        await newAccount.save();

        res.status(201).json({ message: 'Bank account created successfully' });
    } catch (error) {
        console.error('Error creating bank account:', error);
        res.status(500).json({ message: 'Server error during account creation.' });
    }
});

// Function to generate IFSC, account number, and customer ID
function generateAccountDetails(city, email) {
    const IFSC = `ESAR${city.toUpperCase().slice(0, 3)}123`; // Example IFSC generation
    const accountNumber = `22710${Math.floor(Math.random() * 1000000000)}`; // 12-digit account number
    const customerId = `${Math.floor(Math.random() * 1000000000)}`; // Unique customer ID

    return { IFSC, accountNumber, customerId };
}

// Fetch Bank Account Details (User's bank account)
router.get('/accounts/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Find all bank accounts by userId (if a user can have multiple accounts)
        const accounts = await BankAccount.find({ userId }); // Use find instead of findOne
        if (!accounts.length) {
            return res.status(404).json({ message: 'No bank accounts found.' });
        }

        // Send the account details back to the client
        res.status(200).json({ accounts }); // Return an array of accounts
    } catch (error) {
        console.error('Error fetching bank account details:', error);
        res.status(500).json({ message: 'Server error while fetching bank account details.' });
    }
});

router.post('/create-account', async (req, res) => {
    const { userId, accountdetail } = req.body; // Expecting userId and account details object

    try {
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the user already has a current account
        const existingCurrentAccount = await BankAccount.findOne({ userId, accountType: 'Current' });
        if (existingCurrentAccount) {
            return res.status(400).json({ message: 'Current account already exists for this user.' });
        }

        // Check if the user has a savings account and get its details
        const savingsAccount = await BankAccount.findOne({ userId, accountType: 'Savings' });
        if (!savingsAccount || savingsAccount.currentBalance < accountdetail.initialDeposit) {
            return res.status(400).json({ message: 'Insufficient savings account balance to create a current account.' });
        }

        // Reduce the current balance in the savings account
        savingsAccount.currentBalance -= accountdetail.initialDeposit;
        await savingsAccount.save(); // Save the updated savings account

        // Generate details for the new current bank account
        const { IFSC: gIFSC, accountNumber: gbankAccountNumber, customerId: gbankCustomerId } = await generateAccountDetails(user.city, user.email);

        // Create the new current bank account with the required details
        const newAccount = new BankAccount({
            userId: user._id,
            IFSC: savingsAccount.IFSC, // Keep the same IFSC as the savings account
            accountNumber: gbankAccountNumber, // Generated account number
            customerId: savingsAccount.customerId, // Use customerId from the existing savings account
            email: user.email,
            currentBalance: accountdetail.initialDeposit, // Set current balance to initial deposit
            accountType: 'Current',
            panNumber: accountdetail.panNumber,
            nomineeName: accountdetail.nomineeName, // Nominee name
            nomineeAge: accountdetail.nomineeAge, // Nominee age
            nomineeRelation: accountdetail.nomineeRelation // Nominee relation
        });

        // Save the new current account to the database
        await newAccount.save();

        res.status(201).json({ message: 'Current bank account created successfully', account: newAccount });
    } catch (error) {
        console.error('Error creating current account:', error);
        res.status(500).json({ message: 'Server error during current account creation.' });
    }
});

router.get('/loginDetails/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const loginDetail = await LoginDetails.findOne({ email });

        if (!loginDetail) {
            return res.status(404).json({ message: 'Login details not found.' });
        }

        res.status(200).json({ lastLogin: loginDetail.lastLogin });
    } catch (error) {
        console.error('Error fetching login details:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;

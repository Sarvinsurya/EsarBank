const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron'); // Import node-cron for scheduling jobs
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/TransactionRouter');
const { applyMonthlyInterest } = require('./monthlyInterestJob');
const loginRoutes = require('./routes/loginRoutes');
const DepositRoutes =  require('./routes/DepositRoutes');


dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api', userRoutes);
app.use('/api', transactionRoutes);
app.use('/api', DepositRoutes);



cron.schedule('0 0 1 * *', applyMonthlyInterest); // Runs at 12:00 AM on the 1st of each month

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

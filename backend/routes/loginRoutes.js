// // routes/loginRoutes.js
// const LoginDetails =require('../models/LoginDetails');

// const router = express.Router();

// // Handle user login

// router.get('/:email', async (req, res) => {
//     const { email } = req.params;

//     try {
//         const loginDetail = await LoginDetails.findOne({ email });

//         if (!loginDetail) {
//             return res.status(404).json({ message: 'Login details not found.' });
//         }

//         res.status(200).json({ lastLogin: loginDetail.lastLogin });
//     } catch (error) {
//         console.error('Error fetching login details:', error);
//         res.status(500).json({ message: 'Server error.' });
//     }
// });

// module.exports = router;

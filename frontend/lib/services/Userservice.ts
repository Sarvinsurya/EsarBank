import axios from 'axios';
import { jwtDecode, JwtPayload } from 'jwt-decode';

// Define types for SignUpData, SignInData, and AccountDetails
export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  dateOfBirth?: string;
  aadhar?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface GetAccountFromData{
  email: string;
}

export interface AccountDetails {
  IFSC: string;
  accountNumber: string;
  customerId: string;
}

export interface ConfirmAccountResponse {
  message: string;
}

// Bank Account interface
export interface BankAccount {
  IFSC: string;
  accountNumber: string;
  customerId: string;
  currentBalance: number;
  accountType: string;
}

// Payment Transfer data structure
export interface PaymentTransferData {
  senderAccountNumber: string;
  receiverAccountNumber: string;
  email: string;
  amount: number;
  remarks?: string;
}

// Response for payment transfer
export interface PaymentTransferResponse {
  message: string;
  transactionId: string;
  success: boolean;
}

// Variable to hold the token in memory
let authToken: string | null = null; 

// Function to store the token in memory
const setToken = (token: string) => {
  authToken = token;  // Store token in memory
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token); // Store token in localStorage
  }
};

// Updated function to retrieve the token from memory or localStorage
const getToken = () => {

    return authToken;
  }
  
// Function to clear the token from memory
const clearToken = () => {
  authToken = null;
  localStorage.removeItem('authToken');
};

// Function to fetch bank accounts from the server
export const getAccounts = async (userId: string): Promise<BankAccount[]> => {
  try {
    const response = await axios.get(`http://localhost:3000/api/accounts/${userId}`);
    return response.data.accounts;
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    throw error;
  }
};

// Function to handle sign-up
export const signUp = async (userData: SignUpData): Promise<any> => {
  try {
    const response = await axios.post('http://localhost:3000/api/signup', userData);
    return response.data;
  } catch (error) {
    console.error('Error during sign-up:', error);
    throw error;
  }
};

// Function to handle sign-in
export const signIn = async (credentials: SignInData,currentLoginTime:Date): Promise<any> => {
  try {
    const response = await axios.post('http://localhost:3000/api/signin', {
      ...credentials,
      currentLoginTime,
  });
    const { token } = response.data;
    setToken(token);
    console.log('Token stored:', getToken());  // Check if the token is properly logged
    return response.data;
  } catch (error) {
    console.error('Error during sign-in:', error);
    throw error;
  }
};

// Function to confirm account creation
export const handleConfirmAccount = async (
  userId: string,
  accountDetails: AccountDetails
): Promise<ConfirmAccountResponse> => {
  try {
    const response = await axios.post('http://localhost:3000/api/confirm-account', {
      userId,
      accountDetails,
    });
    return response.data;
  } catch (error) {
    console.error('Error during account confirmation:', error);
    throw error;
  }
};

// Function to handle payment transfer
export const transferPayment = async (
  transferData: PaymentTransferData
): Promise<PaymentTransferResponse> => {
  try {
    const { senderAccountNumber, receiverAccountNumber, email, amount, remarks } = transferData;
    const accountExists = await checkIfAccountExists(receiverAccountNumber, email );

    if (!accountExists) {
      return {
        message: 'Receiver account does not exist or does not match the provided email.',
        transactionId: '',
        success: false,
      };
    }

    const token = getToken();
    const response = await axios.post('http://localhost:3000/api/transfer',
      {transferData},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      return {
        success: true,
        message: response.data.message, // Get the success message from the response
        transactionId: response.data.transaction.transactionId, // Assuming the transaction ID is in the response
      };
    } else {
      return {
        success: false,
        message: 'Transfer failed for an unknown reason.',
        transactionId: '',
      };
    }
  } catch (error) {
    console.error('Error during payment transfer:', error);

    // Handle errors specifically if you need to differentiate
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || 'An error occurred during the transaction.',
        transactionId: '',
      };
    }

    // For other types of errors
    return {
      success: false,
      message: 'Internal server error.',
      transactionId: '',
    };
  }
};

// Function to log out and clear token
export const logOut = () => {
  clearToken();
  return true;
};

// User interface for JWT payload
export interface User extends JwtPayload {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Function to retrieve the logged-in user
export const getLoggedInUser = () => {
  const token = getToken(); // Ensure getToken() retrieves your token correctly
  if (!token) return null;

  try {
    const user = jwtDecode<User>(token); // Decode the token
    return user; // Return the user object containing the email
  } catch (error) {
    console.error('Failed to decode token', error); // Handle any decoding errors
    return null;
  }
};

// Fetch accounts based on the email
export const getAccountsByEmail = async (credentials: GetAccountFromData): Promise<any> => {
  try {
    // Pass the email as a query parameter
    const response = await axios.get('http://localhost:3000/api/accountsByEmail', {
      params: {
        email: credentials.email,
      },
    });
    
    return response.data; // Return the full response data
  } catch (error) {
    console.error('Error fetching accounts by email:', error);
    throw error; // Rethrow the error for further handling
  }
};


export const checkIfAccountExists = async (accountNumber: string, email: string): Promise<boolean> => {
  try {
    const response = await axios.get(`http://localhost:3000/api/checkAccount`, {
      params: { accountNumber, email }
    });
    return response.data.exists;
  } catch (error) {
    console.error("Error checking account:", error);
    return false;
  }
};


import { addAccountFormSchema } from '@/lib/utils';
import { z } from "zod";

type AddAccountFormData = z.infer<typeof addAccountFormSchema>;

export const addBankAccount = async (accountDetails: AddAccountFormData) => {
  const token = getToken(); // Retrieve the JWT token from memory

  if (!token) {
    console.error('User is not authenticated');
    return; // Exit if the user is not authenticated
  }

  // Decode the JWT token to get user information
  const decodedUser = jwtDecode<User>(token); // Assuming User is your JWT payload type

  if (!decodedUser || !decodedUser.userId) {
    console.error('Invalid token or user data');
    return; // Exit if the token is invalid
  }

  // Create the data to be sent to the server, including userId from the token
  const data = {
    userId: decodedUser.userId,
    accountdetail : accountDetails,
  };

  try {
    const response = await axios.post('http://localhost:3000/api/create-account', data);
    return { success: true, message: response.data.message }; // Return successful response
} catch (error:any) {
    if (error.response) {
        // Return the error message from the server
        return { success: false, message: error.response.data.message }; 
    } else {
        // Fallback error message
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
};

export const getLastLoginTime = async (email:string) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/loginDetails/${email}`);
    return response.data.lastLogin; // Assuming your API returns { lastLogin: "2024-10-27T12:34:56.789Z" }
  } catch (error) {
    console.error('Error fetching last login time:', error);
    return null; // Return null or handle the error appropriately
  }
};

export const getFDsByEmail = async (email: string): Promise<any> => {
  try {
    const response = await axios.post('http://localhost:3000/api/fds', { email }); // Send email in the request body

    return response.data; // Return the FD records
  } catch (error) {
    console.error('Error fetching FDs by email:', error);
    throw error; // Rethrow the error for further handling
  }
};

// UserService.ts (or your existing UserService file)

import { addDepositFormSchema } from '@/lib/utils'; // Import the schema
type AddDepositFormData = z.infer<typeof addDepositFormSchema>;

// Updated function to add a deposit and include the emailId
 // Ensure axios is imported

export const addDeposit = async (data: AddDepositFormData) => {
  try {
    // Get the logged-in user's details
    const user = getLoggedInUser(); // Synchronous retrieval of the logged-in user
    const emailId = user?.email;
    const principalAmount = data.principalAmount;
    const tenure = data.tenure;
    console.log(data)

    if (!emailId) {
      // If email is not available, return an error
      

      return { success: false, message: 'User email not found. Please sign in again.' };
    }

    // Validate data against the schema

    // Prepare the request body including emailId
    const requestBody = {
      principalAmount,
      tenure, // Principal amount and tenure
      emailId,          // Include emailId with the request
    };
console.log(requestBody)
    // Send the request to the backend using Axios
    const response = await axios.post('http://localhost:3000/api/deposit', requestBody);

    // Parse successful response
    return { success: true, message: response.data.message || 'Deposit added successfully' };

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      // Handle validation errors 
      return { success: false, message: error.issues[0]?.message || 'Validation error' };
    }

    if (axios.isAxiosError(error)) {
      // Handle Axios-specific errors
      return { success: false, message: error.response?.data?.message || 'Error adding deposit' };
    }

    // Handle other types of errors (network or server issues)
    return { success: false, message: 'An error occurred while adding the deposit' };
  }
};

export const withdrawFromFD = async (fdId: string) => {
  try {
    // Placeholder for the API call
    const response = await axios.post("http://localhost:3000/api/withdraw", { fdId });
    return response.data; // Adjust based on the expected response structure
  } catch (error:any) {
    throw new Error('Error withdrawing from FD: ' + error.message);
  }
};


// Export clearToken for sign-out functionality
export { clearToken };



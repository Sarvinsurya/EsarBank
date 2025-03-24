"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import RightSidebar from '@/components/RightSidebar';
import { getAccounts, getLoggedInUser } from '@/lib/services/Userservice';

const TransactionSuccess = () => {
    const [user, setUser] = useState<User | null>(null);
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [totalBalance, setTotalBalance] = useState(0);

    const router = useRouter();
    const searchParams = useSearchParams();

    // Retrieve query parameters from searchParams
    const transactionId = searchParams.get('transactionId');
    const senderAccountNumber = searchParams.get('senderAccountNumber');
    const receiverAccountNumber = searchParams.get('receiverAccountNumber');
    const amount = searchParams.get('amount');
    const transactionTime = searchParams.get('transactionTime');
    const remarks = searchParams.get('remarks');

    useEffect(() => {
        // Fetch the logged-in user details
        const loggedInUser = getLoggedInUser();
        
        if (!loggedInUser) {
            router.push('/sign-in'); // Redirect to sign-in if no user is logged in
        } else {
            setUser(loggedInUser);
            
            // Fetch the bank accounts for the logged-in user
            getAccounts(loggedInUser.userId).then(fetchedAccounts => {
                setAccounts(fetchedAccounts);
                
                // Calculate total balance
                const balance = fetchedAccounts.reduce((total, account) => total + account.currentBalance, 0);
                setTotalBalance(balance);
            });
        }
    }, [router]);

    useEffect(() => {
        // Redirect to home or any other page after a while, if needed
        const timer = setTimeout(() => {
            router.push('/'); // Change to the desired redirect path
        }, 10000); // Redirects after 10 seconds

        return () => clearTimeout(timer); // Clean up the timer on unmount
    }, [router]);

    return (
        <div className="flex">
            {/* Main content area */}
            <div className="transaction-success flex-grow p-4">
                <header className="flex flex-col gap-6 md:gap-10">
                    <h1 className="text-3xl font-bold text-center">Transaction Successful!</h1>
                </header>
                <div className="mt-6 p-6 border border-blue-600 rounded-md bg-blue-200">
                    <h2 className="text-xl font-semibold">Transaction Details</h2>
                    <p className="text-lg"><strong>Transaction ID:</strong> {transactionId}</p>
                    <p className="text-lg"><strong>Sender's Account Number:</strong> {senderAccountNumber}</p>
                    <p className="text-lg"><strong>Receiver's Account Number:</strong> {receiverAccountNumber}</p>
                    <p className="text-lg"><strong>Amount:</strong> ₹{amount}</p>
                    <p className="text-lg"><strong>Transaction Time:</strong> {new Date(transactionTime as string).toLocaleString()}</p>
                    <p className="text-lg"><strong>Remarks:</strong> {remarks}</p>
                </div>
                <p className="mt-6 text-center text-lg">Thank you for using our service!</p>
            </div>

            {/* Right sidebar */}
            <RightSidebar 
                user={user} 
                transactions={[]}  // Assuming you may want to fetch user transactions later
                banks={accounts} 
            />
        </div>
    );
};

export default TransactionSuccess;

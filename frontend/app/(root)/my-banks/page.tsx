'use client';
import BankCard from '@/components/BankCard';
import HeaderBox from '@/components/HeaderBox';
import { getAccounts, getLoggedInUser } from '@/lib/services/Userservice';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const MyBanks = () => {
  const router = useRouter();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<any>(null); // State for logged-in user
  const [loading, setLoading] = useState(true); // Loading state to manage async fetch

  useEffect(() => {
    const fetchUserData = async () => {
      const user = await getLoggedInUser();

      // Check if the user is logged in
      if (!user) {
        router.push('/sign-in'); // Redirect to sign-in page if no user is found
        return; // Exit the function early if no user
      }

      setLoggedInUser(user); // Set the logged-in user in state
      const accounts = await getAccounts(user.userId); // Fetch accounts for the logged-in user
      setAccounts(accounts); // Set the accounts in state
      setLoading(false); // Stop loading after fetching accounts
    };

    fetchUserData(); // Call the async function
  }, [router]);

  if (loading) return <div>Loading...</div>; // Loading indicator

  return (
    <section className="flex">
      <div className="my-banks">
        <HeaderBox 
          title="My Bank Accounts"
          subtext="Effortlessly manage your banking activities."
        />

        <div className="space-y-4">
          <h2 className="header-2">Your cards</h2>
          <div className="flex flex-wrap gap-6">
            {accounts.length > 0 ? (
              accounts.map((a: BankAccount) => (
                <BankCard 
                  key={a.accountNumber} // Use a unique identifier, like accountNumber
                  account={a}
                  userName={loggedInUser?.firstName} // Use the state variable
                />
              ))
            ) : (
              <p>No accounts found.</p> // Handle case with no accounts
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyBanks;
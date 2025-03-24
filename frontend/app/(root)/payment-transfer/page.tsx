"use client"; // Ensure this is a Client Component

import HeaderBox from '@/components/HeaderBox';
import PaymentTransferForm from '@/components/PaymentTransferForm';
import { getAccounts, getLoggedInUser } from '@/lib/services/Userservice';
import { useEffect, useState } from 'react';

const Transfer = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // State to manage loading

  useEffect(() => {
    const fetchUser = async () => {
      const loggedInUser = getLoggedInUser(); // Call your function to get the logged in user

      if (!loggedInUser) {
        console.error('User not found or not logged in');
        return;
      }
      
      setUser(loggedInUser);
      setLoading(false); // Stop loading
    };

    fetchUser();
  }, []);

  if (loading) {
    return <p>Loading...</p>; // Optional loading state
  }

  if (!user || !user.email) {
    return <p>User not found</p>; // Handle if the user or email is not found
  }

  return (
    <section className="payment-transfer">
      <HeaderBox
        title="Payment Transfer"
        subtext="Please provide any specific details or notes related to the payment transfer"
      />

      <section className="size-full pt-5">
        <PaymentTransferForm email={user.email} />
      </section>
    </section>
  );
};

export default Transfer;

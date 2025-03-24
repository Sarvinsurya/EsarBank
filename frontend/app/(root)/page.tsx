'use client';

import HeaderBox from '@/components/HeaderBox';
import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import { getLoggedInUser, getAccounts } from '@/lib/services/Userservice'; // Import the new getAccounts function
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BankAccount} from '@/lib/services/Userservice';
import RecentTransactions from '@/components/RecentTransactoins';

const Home = () => {
  const router = useRouter();
  
// Assuming User is the correct type for the logged-in user
const [user, setUser] = useState<User | null>(null);
const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [totalBalance, setTotalBalance] = useState(0); // State to store total balance

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
        console.log(fetchedAccounts);
        const balance = fetchedAccounts.reduce((total, account) => total + account.currentBalance, 0);
        console.log("balance:",balance);
        setTotalBalance(balance);
      });
    }
  }, [router]);

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox 
            type="greeting"
            title="Welcome"
            user={user?.firstName || 'Guest'} // Display first name of logged-in user
            subtext="Access and manage your account and transactions efficiently."
          />

          <TotalBalanceBox 
            accounts={accounts} // Pass the fetched accounts
            totalBanks={accounts.length} // Number of banks
            totalCurrentBalance={totalBalance} // Total current balance
          />
        </header>
        <RecentTransactions 
            accounts={accounts} 
            totalBanks={accounts.length}
          />
      </div>
      
      <RightSidebar 
        user={user} // Pass the logged-in user
        transactions={[]} // No transactions to display for now
        banks={accounts} // Pass the fetched accounts to RightSidebar
      />
    </section>
  );
};

export default Home;
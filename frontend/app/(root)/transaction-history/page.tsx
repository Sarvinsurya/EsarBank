"use client";

import HeaderBox from '@/components/HeaderBox';
import Pagination from '@/components/Pagination';
import TransactionsTable from '@/components/TransactionsTable';
import { getAccounts, BankAccount } from '@/lib/services/Userservice';
import { getLoggedInUser } from '@/lib/services/Userservice';
import { formatAmount } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface SearchParamProps {
  searchParams: {
    id?: string; // Optional account number
    page?: string; // Optional page number
  };
}
interface Transaction {
  transactionId: string;
  senderAccountNumber: string;
  receiverAccountNumber: string;
  amount: number;
  remarks: string;
  status: string;
  transactionTime: string;
  type: 'debit' | 'credit'; 
}

const TransactionHistory = ({ searchParams: { id, page } }: SearchParamProps) => {
  const currentPage = Number(page) || 1;

  // State to store transactions and pagination
  const [currentTransactions, setCurrentTransactions] = useState<Transaction[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPageState, setCurrentPageState] = useState(currentPage); // State to track the current page
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null); // State for selected account

  // Fetch user and accounts when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      const loggedInUser = await getLoggedInUser();
      if (!loggedInUser) {
        console.error("No logged-in user found.");
        return;
      }

      const accounts: BankAccount[] = await getAccounts(loggedInUser.userId);
      
      // Default to the first account if no account ID is provided
      const selectedAccountId = id || accounts[0]?.accountNumber;
      const account = accounts.find(account => account.accountNumber === selectedAccountId);

      if (!account) {
        console.error("No account found.");
        return;
      }

      setSelectedAccount(account);
      fetchTransactions(account.accountNumber); // Fetch transactions for the selected account
    };

    fetchData();
  }, [id]); // Run when the component mounts or when id changes

  const fetchTransactions = async (accountNumber: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/transactions/${accountNumber}`);
      const data = await response.json();

      // Sort transactions by transaction time, most recent first
      const sortedTransactions = data.transactions.sort(
        (a: Transaction, b: Transaction) => new Date(b.transactionTime).getTime() - new Date(a.transactionTime).getTime()
      );

      setCurrentTransactions(sortedTransactions);
      setTotalPages(Math.ceil(sortedTransactions.length / 10)); 
      setCurrentPageState(1); 
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPageState(page);
  };

  // Calculate pagination
  const indexOfLastTransaction = currentPageState * 10; // Assuming rowsPerPage is 10
  const indexOfFirstTransaction = indexOfLastTransaction - 10;
  const transactionsToDisplay = currentTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  if (!selectedAccount) {
    return <p>Loading account details...</p>; // Show loading state while fetching account details
  }

  return (
    <div className="transactions">
      <div className="transactions-header">
        <HeaderBox 
          title="Transaction History"
          subtext="See your bank details and transactions."
        />
      </div>

      <div className="space-y-6">
        <div className="transactions-account">
          <div className="flex flex-col gap-2">
            <h2 className="text-18 font-bold text-white">ACCOUNT NUMBER : <span>{selectedAccount.accountNumber}</span></h2>
            <p className="text-14 text-blue-25">IFSC CODE : <span>{selectedAccount.IFSC}</span></p>
            <p className="text-14 font-semibold tracking-[1.1px] text-white">
              Account Type : <span>{selectedAccount.accountType}</span>
            </p>
          </div>
          
          <div className="transactions-account-balance">
            <p className="text-14">Current balance</p>
            <p className="text-24 text-center font-bold">
              {formatAmount(selectedAccount.currentBalance)}
            </p>
          </div>
        </div>

        <section className="flex w-full flex-col gap-6">
          <TransactionsTable transactions={transactionsToDisplay} />
          {totalPages > 1 && (
            <div className="my-4 w-full">
              <Pagination totalPages={totalPages} page={currentPageState} onPageChange={handlePageChange} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TransactionHistory;

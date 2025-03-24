import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from 'react';
import TransactionsTable from './TransactionsTable';
import Pagination from './Pagination';
import { cn } from '@/lib/utils';

declare interface RecentTransactionsProps {
  accounts: BankAccount[];
  totalBanks: number;
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

const RecentTransactions = ({ accounts, totalBanks }: RecentTransactionsProps) => {
  const [currentTransactions, setCurrentTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState<string | undefined>(accounts[0]?.accountNumber);

  const rowsPerPage = 10;

  // Calculate the transactions for the current page
  const indexOfLastTransaction = page * rowsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;
  const transactionsForCurrentPage = currentTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  useEffect(() => {
    if (accounts.length > 0) {
      // Set the first account as the default account
      setSelectedAccount(accounts[0].accountNumber);
      fetchTransactions(accounts[0].accountNumber);  // Fetch transactions for the default account
    }
  }, [accounts]);

  const fetchTransactions = async (accountNumber: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/transactions/${accountNumber}`);
      const data = await response.json();

      // Sort transactions by transaction time, most recent first
      const sortedTransactions = data.transactions.sort(
        (a: Transaction, b: Transaction) => new Date(b.transactionTime).getTime() - new Date(a.transactionTime).getTime()
      );

      setCurrentTransactions(sortedTransactions);
      setTotalPages(Math.ceil(sortedTransactions.length / rowsPerPage)); // Set total pages
      setPage(1); // Reset to the first page when fetching new transactions
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleTabChange = (accountNumber: string) => {
    setSelectedAccount(accountNumber);  // Update the selected account number
    fetchTransactions(accountNumber);   // Fetch transactions for the selected account
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage); // Update the current page
  };

  return (
    <section className="recent-transactions">
      <header className="flex items-center justify-between">
        <h2 className="recent-transactions-label">Recent transactions</h2>
        {selectedAccount && (
          <Link
            href={`/transaction-history/?id=${selectedAccount}`}
            className="view-all-btn"
          >
            View all
          </Link>
        )}
      </header>

      {accounts.length > 0 && (
        <Tabs value={selectedAccount} className="w-full" onValueChange={handleTabChange}>
          <TabsList className="recent-transactions-tablist">
            {accounts.map((account: BankAccount) => (
              <TabsTrigger
                key={account.accountNumber}
                value={account.accountNumber}
                className={cn(
                  'text-16 line-clamp-1  font-medium text-gray-500', 'banktab-item',
                  {
                    'text-blue-600 border-blue-600': selectedAccount === account.accountNumber, // Apply blue styles when active
                  }
                )}
              >
                {account.accountType} ({account.accountNumber})
              </TabsTrigger>
            ))}
          </TabsList>

          {accounts.map((account: BankAccount) => (
            <TabsContent
              value={account.accountNumber}
              key={account.accountNumber}
              className="space-y-4"
            >
              {/* Display transactions for the selected account */}
              {selectedAccount === account.accountNumber && (
                <>
                  <TransactionsTable transactions={transactionsForCurrentPage} />

                  {totalPages > 1 && (
                    <div className="my-4 w-full">
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </section>
  );
};

export default RecentTransactions;

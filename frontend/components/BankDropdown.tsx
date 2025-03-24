"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { getAccountsByEmail } from "@/lib/services/Userservice";

// Define the BankAccount type
interface BankAccount {
  accountNumber: string;
  accountType: string;
  accbalance: number;
}

interface BankDropdownProps {
  email: string;
  onAccountSelect: (accountNumber: string) => void; 
}

export const BankDropdown = ({ email,onAccountSelect  }: BankDropdownProps) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch accounts when the component is mounted or the email changes
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true); // Set loading state
      setError(null); // Clear previous errors
      setSelectedAccount(null); // Clear selected account when email changes

      try {
        const fetchedAccounts = await getAccountsByEmail({ email });
        setAccounts(fetchedAccounts);
      } catch (error) {
        console.error("Error fetching accounts:", error);
        setError("Failed to fetch accounts. Please try again.");
      } finally {
        setLoading(false); // End loading state
      }
    };

    if (email) {
      fetchAccounts();
    }
  }, [email]);

  const handleAccountSelect = (accountNumber: string) => {
    setSelectedAccount(accountNumber);
    onAccountSelect(accountNumber);  // Call the function passed from the parent component
  };
  
  return (
    <div className="flex w-full bg-white gap-3 md:w-[300px]">
      {loading ? (
        <p>Loading accounts...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <Select onValueChange={handleAccountSelect}>
          <SelectTrigger className="flex w-full bg-white gap-3 md:w-[300px]">
            {selectedAccount
              ? selectedAccount
              : accounts.length > 0
              ? "Select an account"
              : "No accounts found"}
          </SelectTrigger>
          <SelectContent>
            {accounts.length > 0 ? (
              accounts.map((account) => (
                <SelectItem
                  key={account.accountNumber}
                  value={account.accountNumber}
                >
                  <p className="line-clamp-1 bg-white w-full text-left">{account.accountNumber} - {account.accountType}</p>
                </SelectItem>
              ))
            ) : (
              <SelectItem disabled value="">
                No accounts found
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

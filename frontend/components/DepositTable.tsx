'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HeaderBox from './HeaderBox';
import { getLoggedInUser, getFDsByEmail ,withdrawFromFD } from '@/lib/services/Userservice';

interface FD {
  fdId: string;
  principalAmount: number;
  tenure: number;
  depositDate: string;
  interestRate: number;
  maturityDate?: string;
  maturityAmount?: number;
}

const FDDetailsTable: React.FC = () => {
  const [fds, setFds] = useState<FD[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [selectedFDs, setSelectedFDs] = useState<FD | null>(null); // State to hold selected FD for withdrawal

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getLoggedInUser();
        if (user) {
          setUserEmail(user.email);
          setUserName(user.firstName);
          const userFds = await getFDsByEmail(user.email);
          setFds(userFds);
        } else {
          setError('No user is currently logged in.');
        }
      } catch (err) {
        setError('Failed to load fixed deposits');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalMaturityAmount = fds.reduce((acc, fd) => acc + (fd.maturityAmount || 0), 0);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Handle navigation to add-deposit page
  const handleAddDepositClick = () => {
    router.push('/add-deposit');
  };

  // Handle withdrawal functionality
  const handleWithdrawDepositClick = (fd: FD) => {
    
    setSelectedFDs(fd); // Set the selected FD for withdrawal
  };

  // Function to handle withdrawal confirmation
  // const handleConfirmWithdrawal = () => {
  //   if (selectedFDs) {
  //     // Implement withdrawal logic here, e.g., sending a request to the server
  //     console.log(Confirming withdrawal for FD ID: ${selectedFDs.fdId});
  //     // Reset selected FD after confirmation
  //     setSelectedFDs(null);
  //   }
  // };
  const handleConfirmWithdrawal = async () => {
    if (selectedFDs) {
      try {
        const result = await withdrawFromFD(selectedFDs.fdId);
        console.log('Withdrawal successful:', result);
        alert("withdrawal successful!")
        // Optionally, refresh the FD list or show a success message
        // setFds(prevFds => prevFds.filter(fd => fd.fdId !== selectedFDs.fdId));
        setSelectedFDs(null);
        router.push("/")

      } catch (error) {
        console.error('Error during withdrawal:', error);
        setError('Failed to withdraw from FD.');
      }
    }
  };
  return (
    <section className="flex">
      <div className="my-banks w-full">
        <div className="w-full overflow-x-auto">
          <div className="mb-6">
            <HeaderBox 
              title="Fixed Deposits"
              subtext="Effortlessly manage your banking activities."
            />
          </div>

          <h2 className="header-2 mb-4">Existing Deposits of {userName}</h2>

          <div className="flex flex-wrap gap-6 mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-500">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">FD id</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Principal Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Interest Rate (%)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Tenure (Years)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Deposit Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Maturity Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Maturity Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fds.length > 0 ? (
                  fds.map((fd, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fd.fdId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fd.principalAmount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fd.interestRate}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fd.tenure}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(fd.depositDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fd.maturityDate ? new Date(fd.maturityDate).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fd.maturityAmount !== undefined ? fd.maturityAmount : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleWithdrawDepositClick(fd)} // Pass the FD to the click handler
                          className="text-red-600 hover:underline"
                        >
                          Withdraw
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No fixed deposits available.</td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
            {fds.length > 0 && !selectedFDs && (
             <div className="mt-4 flex justify-center">
                <strong>Total Maturity Amount: {totalMaturityAmount}</strong>
              </div>
            )}
          

          {/* Add Deposit Button */}
          {!selectedFDs && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleAddDepositClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Add Deposit
              </button>
            </div>
          )}

          {/* Confirm Withdrawal Section */}
          {selectedFDs && (
            <div className="mt-6 flex flex-col items-center">
              <p className="mb-4">
                <strong> Are you sure you want to withdraw from FD: {selectedFDs.fdId}
                  
                  </strong> 
              </p>
              <button
                onClick={handleConfirmWithdrawal}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
              >
                Confirm
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FDDetailsTable;
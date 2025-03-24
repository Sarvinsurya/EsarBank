import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import BankCard from './BankCard';
import { BankAccount } from '@/lib/services/Userservice'; // Import the BankAccount type

interface RightSidebarProps {
  user: any;
  transactions: any[];
  banks: BankAccount[]; // Use the BankAccount type for banks
}

const RightSidebar = ({ user, transactions, banks }: RightSidebarProps) => {
  return (
    <aside className="right-sidebar">
      <section className="flex flex-col pb-8">
        <div className="profile-banner" />
        <div className="profile">
          <div className="profile-img">
            {user ? (
              <span className="text-5xl font-bold text-blue-500">{user.firstName[0]}</span>
            ) : (
              <span className="text-5xl font-bold text-blue-500">?</span>
            )}
          </div>

          <div className="profile-details">
            <h1 className='profile-name'>
              {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
            </h1>
            <p className="profile-email">
              {user ? user.email : 'No email available'}
            </p>
          </div>
        </div>
      </section>

      <section className="banks">
        <div className="flex w-full justify-between">
          <h2 className="header-2">My Accounts</h2>
          <Link href="/add-account" className="flex gap-2">
            <Image 
              src="/icons/plus.svg"
              width={20}
              height={20}
              alt="plus"
            />
            <h2 className="text-14 font-semibold text-gray-600">
              Add Account
            </h2>
          </Link>
        </div>

        {banks?.length > 0 && (
          <div className="relative flex flex-1 flex-col items-center justify-center gap-15">
          <div className='relative z-10 w-[93%] '>
            <BankCard 
              key={banks[0].accountNumber}
              account={banks[0]}
              userName={`${user.firstName} ${user.lastName}`}
              showBalance={false}
            />
          </div>
          {banks[1] && (
            <div className="absolute right-0 top-8 z-0 w-[90%] y-[10%]">
              <BankCard 
                key={banks[1].accountNumber}
                account={banks[1]}
                userName={`${user.firstName} ${user.lastName}`}
                showBalance={false}
              />
            </div>
          )}
        </div>
        )}
      </section>
    </aside>
  );
};

export default RightSidebar;
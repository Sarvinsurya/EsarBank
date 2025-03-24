'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import { getLoggedInUser } from '@/lib/services/Userservice';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const loggedIn = getLoggedInUser(); // Fetch logged-in user from userServices

  // Check if user is logged in and redirect if not
  useEffect(() => {
    if (!loggedIn) {
      router.push('/sign-in'); // Redirect to sign-in if no user is logged in
    }
  }, [loggedIn, router]);

  // If no user is logged in, show nothing until redirect
  if (!loggedIn) return null;

  return (
    <main className="flex h-screen w-full font-inter">
      <Sidebar user={loggedIn} />
      <div className="flex size-full flex-col">
        <div className="root-layout">
          <Image src="icons/logo.svg" width={30} height={30} alt="logo" />
          <div>
            <MobileNav user={loggedIn} />
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}
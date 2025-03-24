import { getLastLoginTime, logOut } from '@/lib/services/Userservice'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Footer = ({ user, type = 'desktop' }: FooterProps) => {
  const router = useRouter();
  const [lastLogin, setLastLogin] = useState(null); // State to store last login time

  const handleLogOut = async () => {
    const loggedOut = await logOut();

    if(loggedOut)  router.push('/sign-in')
  }

  useEffect(() => {
    const fetchLastLoginTime = async () => {
      if (user?.email) {
        const lastLoginTime = await getLastLoginTime(user.email);
        setLastLogin(lastLoginTime);
      }
    };

    fetchLastLoginTime();
  }, [user]);


  return (
    <footer className="footer">
      <div className={type === 'mobile' ? 'footer_name-mobile' : 'footer_name'}>
        <p className="text-xl font-bold text-gray-700">
          {user?.firstName ? user.firstName[0]:''}
        </p>
      </div>

      <div className={type === 'mobile' ? 'footer_email-mobile' : 'footer_email'}>
        <h1 className="text-14 truncate text-gray-700 font-semibold">
          {user?.firstName}
        </h1>
        <p className="text-14 truncate font-normal text-gray-600">
          {user?.email}
        </p>
        {lastLogin && ( // Display last login time if it exists
          <p className="text-12 text-gray-500">
            Last Login: {new Date(lastLogin).toLocaleString()}
          </p>
        )}
      </div>

      <div className="footer_image" onClick={handleLogOut}>
        <Image src="icons/logout.svg" fill alt="jsm" />
      </div>
    </footer>
  )
}

export default Footer
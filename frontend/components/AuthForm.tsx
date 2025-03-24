'use client'

import Link from 'next/link'
import Image from "next/image"
import React, { useState } from 'react'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from 'lucide-react';
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import CustomInput from './CustomInput'
import { authFormSchema } from '@/lib/utils'
import { useRouter } from 'next/navigation';

import { signUp, signIn, SignUpData, SignInData, handleConfirmAccount } from '@/lib/services/Userservice';

// Define user and accountDetails types explicitly
interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AccountDetails {
  IFSC: string;
  accountNumber: string;
  customerId: string;
}

const AuthForm = ({ type }: { type: string }) => {
    const router = useRouter();
    
    // Set user and accountDetails with proper types
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
    
    
    const formSchema = authFormSchema(type);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            if (type === 'sign-up') {
                const userData: SignUpData = {
                    firstName: data.firstName!,
                    lastName: data.lastName!,
                    email: data.email,
                    password: data.password,
                    address1: data.address1!,
                    city: data.city!,
                    state: data.state!,
                    postalCode: data.postalCode!,
                    dateOfBirth: data.dateOfBirth!,
                    aadhar: data.aadhar!,
                };

                const newUser = await signUp(userData);
                setUser(newUser);
                console.log("account called");
                setAccountDetails(newUser.accountDetails); // Store account details
            }

            if (type === 'sign-in') {
                const credentials: SignInData = {
                    email: data.email,
                    password: data.password,
                };
                const currentLoginTime = new Date();
                const response = await signIn(credentials,currentLoginTime);
                if (response) router.push('/');
            }
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.message) {
                // Display API error message like "Invalid email or password" if provided
                setErrorMessage(error.response.data.message);
                
            } else if (error.message) {
                setErrorMessage(error.message); // Display any generic error message
            } else {
                setErrorMessage("An unexpected error occurred.");
            }
            console.log("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const onConfirmAccount = async () => {
      console.log("this called");
        if (user && accountDetails) {
            try {
                await handleConfirmAccount(user.userId, accountDetails);
                router.push('/'); // Redirect after confirming account
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <section className='auth-form'>
            <header className='flex flex-col gap-5 md:gap-8'>
                <Link href='/' className='cursor-pointer flex items-center gap-1 '>
                    <Image
                        src='/icons/logo.svg'
                        alt='Esar Logo'
                        width={34}
                        height={34}
                    />
                    <h1 className='text-26 font-ibm-plex-serif font-bold text-black-1'> Esar Bank</h1>
                </Link>

                <div className="flex flex-col gap-1 md:gap-3">
                    <h1 className='text-24 lg:text-36 font-semibold text-grey-900'>
                        {user
                            ? 'Link Account'
                            : type === "sign-in"
                                ? 'Sign In'
                                : 'Sign Up'
                        }
                        <p className="text-16 font-normal text-gray-600">
                            {user
                                ? 'Link your account to get started'
                                : 'Please enter your details'
                            }
                        </p>
                    </h1>
                </div>
            </header>

            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}


            {user ? (
                <div className="flex flex-col gap-4">
                    <h2>Account Details:</h2>
                    <p>IFSC: {accountDetails?.IFSC}</p>
                    <p>Account Number: {accountDetails?.accountNumber}</p>
                    <p>Customer ID: {accountDetails?.customerId}</p>
                    <Button onClick={onConfirmAccount} className="form-btn">
                        Confirm Account Creation
                    </Button>
                </div>
            ) : (
                <>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {type === 'sign-up' && (
                                <>
                                    <div className="flex gap-4">
                                        <CustomInput control={form.control} name='firstName' label="First Name" placeholder='Enter your first name' />
                                        <CustomInput control={form.control} name='lastName' label="Last Name" placeholder='Enter your last name' />
                                    </div>
                                    <CustomInput control={form.control} name='address1' label="Address" placeholder='Enter your specific address' />
                                    <CustomInput control={form.control} name='city' label="City" placeholder='Enter your city' />
                                    <div className="flex gap-4">
                                        <CustomInput control={form.control} name='state' label="State" placeholder='Example: NY' />
                                        <CustomInput control={form.control} name='postalCode' label="Postal Code" placeholder='Example: 642109' />
                                    </div>
                                    <div className="flex gap-4">
                                        <CustomInput control={form.control} name='dateOfBirth' label="Date of Birth" placeholder='YYYY-MM-DD' />
                                        <CustomInput control={form.control} name='aadhar' label="aadhar" placeholder='Aadhar number' />
                                    </div>
                                </>
                            )}

                            <CustomInput control={form.control} name='email' label="Email" placeholder='Enter your email' />
                            <CustomInput control={form.control} name='password' label="Password" placeholder='Enter your password' />

                            <div className="flex flex-col gap-4">
                                <Button type="submit" disabled={isLoading} className="form-btn">
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" /> &nbsp;
                                            Loading...
                                        </>
                                    ) : type === 'sign-in'
                                        ? 'Sign In' : 'Sign Up'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                    <footer className="flex justify-center gap-1">
                        <p className="text-14 font-normal text-gray-600">
                            {type === 'sign-in'
                                ? "Don't have an account?"
                                : "Already have an account?"}
                        </p>
                        <Link href={type === 'sign-in' ? '/sign-up' : '/sign-in'} className="form-link">
                            {type === 'sign-in' ? 'Sign up' : 'Sign in'}
                        </Link>
                    </footer>
                </>
            )}
        </section>
    )
}

export default AuthForm;
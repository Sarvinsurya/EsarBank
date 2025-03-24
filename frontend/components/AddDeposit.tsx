'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDepositFormSchema } from '@/lib/utils'; // Import the schema
import AddDepositInput from './AddDepositInput'; // Import the CustomInput component
import { Button } from '@/components/ui/button'; // Button component for submit
import { Loader2 } from 'lucide-react'; // Loading spinner icon
import Link from 'next/link';
import Image from 'next/image';
import { addDeposit } from '@/lib/services/Userservice'; // Import the service
import { z } from 'zod';
import { useRouter } from 'next/navigation';


type AddDepositFormData = z.infer<typeof addDepositFormSchema>;

const AddDeposit = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // To handle errors

  // Use useForm to initialize form methods
  const formMethods = useForm<AddDepositFormData>({
    resolver: zodResolver(addDepositFormSchema),
  });
  const router = useRouter();

  const onSubmit = async (data: AddDepositFormData) => {
    setIsLoading(true);
    setErrorMessage(null); // Clear any previous error message

    const response = await addDeposit(data);
    setIsLoading(false);

    // Alert the user based on the response
    if (response?.success) {
      alert(response?.message); // Show success message
      router.push('/Deposit'); // Redirect to homepage
    } else {
       // Show error message from service
      setErrorMessage(response?.message); // Store the error message for display if needed
    }
  };

  return (
    <section className="add-deposit-section">
      <header className="flex flex-col gap-3 md:gap-4"> {/* Adjusted gap between header elements */}
        <Link href='/' className='cursor-pointer flex items-center gap-1'>
          <Image
            src='/icons/logo.svg'
            alt='Esar Logo'
            width={34}
            height={34}
          />
          <h1 className='text-26 font-ibm-plex-serif font-bold text-black-1'> Esar Bank</h1>
        </Link>

        <h1 className="text-24 lg:text-30 font-semibold text-grey-900 mt-3"> {/* Adjusted margin */}
          Add a New Deposit
        </h1>

        <h1 className="text-24 lg:text-20 font-semibold text-grey-900 mt-3 ">
  Interest Rate:</h1>
  <p className="text-16 font-normal text-gray-600 mb-3 ">
   {"(≤ 5 years: 5.0%) | (5 - 10 years: 6.5%) | (> 10 years: 7.5%)"}
</p>




        
      </header>

      <FormProvider {...formMethods}>
        {/* Ensure the form is wrapped in FormProvider */}
        <form onSubmit={formMethods.handleSubmit(onSubmit)} className="add-deposit-form space-y-6"> {/* Adjusted form gap */}
          <div className="flex gap-4">
            <AddDepositInput
              control={formMethods.control}
              name="principalAmount"
              label="Principal Amount"
              placeholder="Enter the principal amount"
              type="text" // Numeric input for principal amount
            />
          </div>

          <div className="flex gap-4">
            <AddDepositInput
              control={formMethods.control}
              name="tenure"
              label="Tenure (Years)"
              placeholder="Enter the tenure in years"
              type="text" // Numeric input for tenure
            />
          </div>

          <div className="flex flex-col gap-4 mt-5"> {/* Adjusted button section spacing */}
            <Button type="submit" className="form-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> &nbsp;
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </div>

          {errorMessage && <p className="text-red-500">{errorMessage}</p>} {/* Display error */}
        </form>
      </FormProvider>
    </section>
  );
};

export default AddDeposit;
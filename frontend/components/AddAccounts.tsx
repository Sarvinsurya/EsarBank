'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addAccountFormSchema } from '@/lib/utils'; // Import the schema
import AddAccountInput from './AddAccountInput'; // Import the CustomInput component
import { Button } from '@/components/ui/button'; // Button component for submit
import { Loader2 } from 'lucide-react'; // Loading spinner icon
import Link from 'next/link';
import Image from 'next/image';
import { addBankAccount } from '@/lib/services/Userservice'; // Import the service
import { z } from 'zod';
import { useRouter } from 'next/navigation';


type AddAccountFormData = z.infer<typeof addAccountFormSchema>;

const AddAccount = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // To handle errors

  // Use useForm to initialize form methods
  const formMethods = useForm<AddAccountFormData>({
    resolver: zodResolver(addAccountFormSchema),
  });
  const router = useRouter();

  const onSubmit = async (data: AddAccountFormData) => {
  setIsLoading(true);
  setErrorMessage(null); // Clear any previous error message

  const response = await addBankAccount(data);
  setIsLoading(false);

  // Alert the user based on the response
  if (response?.success) {
    alert(response?.message); // Show success message
    router.push('/'); // Redirect to homepage
  } else {
     // Show error message from service
    setErrorMessage(response?.message); // Store the error message for display if needed
  }
};


  return (
    <section className="add-account-section">
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

        <h1 className="text-24 lg:text-36 font-semibold text-grey-900 mt-3"> {/* Adjusted margin */}
          Add a New Account
        </h1>

        <p className="text-16 font-normal text-gray-600 mb-2"> {/* Adjusted margin */}
          Please fill in the details to add a new account.
        </p>
      </header>

      <FormProvider {...formMethods}>
        {/* Ensure the form is wrapped in FormProvider */}
        <form onSubmit={formMethods.handleSubmit(onSubmit)} className="add-account-form space-y-6"> {/* Adjusted form gap */}
          <div className="flex gap-4">

        <AddAccountInput
          control={formMethods.control}
          name="panNumber"
          label="PAN Number"
          placeholder="Enter PAN number"
        />
                  </div>

      <div className="flex gap-4">
        <AddAccountInput
          control={formMethods.control}
          name="initialDeposit"
          label="Initial Deposit"
          placeholder="Enter initial deposit"
          type="number"
          
        />
       </div>

      <div className="flex gap-4">
        <AddAccountInput
          control={formMethods.control}
          name="nomineeName"
          label="Nominee Name"
          placeholder="Enter nominee name"
        />
      </div>

      <div className="flex gap-4">
        <AddAccountInput
          control={formMethods.control}
          name="nomineeAge"
          label="Nominee Age"
          placeholder="Enter nominee age"
          type="number"
        />
        </div>

        <div className="flex gap-4">

        <AddAccountInput
          control={formMethods.control}
          name="nomineeRelation"
          label="Nominee Relation"
          placeholder="Enter relation with nominee"
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

export default AddAccount;
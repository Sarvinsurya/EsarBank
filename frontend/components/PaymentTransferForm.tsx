"use client"; 

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { BankDropdown } from "./BankDropdown";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { transferPayment } from "@/lib/services/Userservice";
import { useRouter } from 'next/navigation';


// Zod schema for form validation
const formSchema = z.object({
  receiverAccountNumber: z.string(), 
  email: z.string().email("Please enter a valid email address"),
  remarks: z.string().optional(),
  amount: z.string(),
});

interface PaymentTransferFormProps {
  email: string;
}

const PaymentTransferForm = ({ email }: PaymentTransferFormProps) => {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      receiverAccountNumber: "",
      email: "",
      remarks: "", 
      amount: "",
    },
  });

  

  const [isLoading, setIsLoading] = useState(false);
  const [selectedSenderAccount, setSelectedSenderAccount] = useState<string | null>(null);

  const handleAccountSelect = (accountNumber: string) => {
    setSelectedSenderAccount(accountNumber);
  };

  const submit = async (data: any) => {
    if (!selectedSenderAccount) {
      alert("Please select a sender's bank account.");
      return;
    }

    setIsLoading(true);
    try {
      const { receiverAccountNumber, email, remarks , amount:amountStr } = data;
      const amount = parseFloat(amountStr); 

      const transferData = {
        senderAccountNumber: selectedSenderAccount,
        receiverAccountNumber: receiverAccountNumber,
        email,
        amount,
        remarks, 
      };
  
      // Use the transferPayment function to process the transfer
      const transferResponse = await transferPayment(transferData);
  
      if (transferResponse.success) {

        const url = `/transaction-success?transactionId=${transferResponse.transactionId}&senderAccountNumber=${encodeURIComponent(selectedSenderAccount)}&receiverAccountNumber=${encodeURIComponent(receiverAccountNumber)}&amount=${amount}&transactionTime=${encodeURIComponent(new Date().toISOString())}&remarks=${encodeURIComponent(remarks)}`;  
        router.push(url);
        } else {
          alert(`Transfer failed: ${transferResponse.message}`);
        }
      
         
    } catch (error) {
      console.error("Payment transfer failed:", error);
      alert("An error occurred during the payment transfer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="flex flex-col">
        {/* Bank Dropdown to select sender's account */}
        <div className="border-t border-gray-200 pb-6 pt-5">
          <div className="payment-transfer_form-item">
            <FormLabel className="text-14 font-medium text-gray-700">Select Source Bank</FormLabel>
            <FormDescription className="text-12 font-normal text-gray-600">
              Select the bank account you want to transfer funds from
            </FormDescription>
            <BankDropdown email={email} onAccountSelect={handleAccountSelect} />
          </div>
        </div>
        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem className="border-t border-gray-200">
              <div className="payment-transfer_form-item pb-6 pt-5">
                <FormLabel className="text-14 font-medium text-gray-700">Transfer Note (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Write a short note here" {...field} />
                </FormControl>
                <FormMessage className="text-12 text-red-500" />
              </div>
            </FormItem>
          )}
        />

        <div className="payment-transfer_form-details">
          <h2 className="text-18 font-semibold text-gray-900">Bank account details</h2>
          <p className="text-16 font-normal text-gray-600">Enter the bank account details of the recipient</p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="border-t border-gray-200">
              <div className="payment-transfer_form-item py-5">
              <FormLabel className="text-14 font-medium text-gray-700 mt-15">Recipient's Email Address</FormLabel>
              <div className="flex w-full flex-col">

              <FormControl>
                <Input placeholder="ex: sample@gmail.com" className="input-class mt-15" {...field} />
              </FormControl>
              <FormMessage className="text-12 text-red-500" />
              </div>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="receiverAccountNumber" // Update to reflect the account number
          render={({ field }) => (
            <FormItem className="border-t border-gray-200">
              <div className="payment-transfer_form-item pb-5 pt-6">

              <FormLabel className="text-14 font-medium text-gray-700">Receiver's Account Number</FormLabel>
              <div className="flex w-full flex-col">

              <FormControl>
                <Input placeholder="Enter the public account number" className="input-class"  {...field} />
              </FormControl>
              <FormMessage className="text-12 text-red-500" />
              </div>
            </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem className="border-y border-gray-200">
              <div className="payment-transfer_form-item py-5">

              <FormLabel className="text-14 font-medium text-gray-700">Amount</FormLabel>
              <div className="flex w-full flex-col">

              <FormControl>
                <Input placeholder="ex: 5.00" className="input-class"{...field} />
              </FormControl>
              <FormMessage className="text-12 text-red-500" />
              </div>
              </div>
            </FormItem>
          )}
        />

        <div className="payment-transfer_btn-box">
          <Button type="submit" className="payment-transfer_btn">
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> &nbsp; Sending...
              </>
            ) : (
              "Transfer Funds"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};



export default PaymentTransferForm;

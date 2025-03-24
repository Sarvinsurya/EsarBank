import React from 'react';
import { FormControl, FormField, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Control, FieldPath } from 'react-hook-form';
import { z } from 'zod';

// Updated schema for AddAccount form with required nominee fields
export const addAccountFormSchema = z.object({
  panNumber: z.string().min(10, "PAN number must be exactly 10 characters").max(10, "PAN number must be exactly 10 characters"),
  initialDeposit: z.number().min(0, "Initial deposit must be at least 0"),
  nomineeName: z.string().min(1, "Nominee name is required"),
  nomineeAge: z.number().int().min(1, "Nominee age is required"),
  nomineeRelation: z.string().min(1, "Nominee relation is required"),
});

// Custom input component for the AddAccount form
interface AddAccountInputProps {
  control: Control<z.infer<typeof addAccountFormSchema>>;
  name: FieldPath<z.infer<typeof addAccountFormSchema>>;
  label: string;
  placeholder: string;
  type?: string;  // Optional type (e.g., for numeric inputs)
}

const AddAccountInput: React.FC<AddAccountInputProps> = ({ control, name, label, placeholder, type = "text" }) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <div className="form-item">
          <FormLabel className="form-label">{label}</FormLabel>
          <div className="flex w-full flex-col">
            <FormControl>
              <Input
                placeholder={placeholder}
                className="input-class"
                type={type}
                {...field}
              />
            </FormControl>
            <FormMessage className="form-message mt-2" />
          </div>
        </div>
      )}
    />
  );
};

export default AddAccountInput;

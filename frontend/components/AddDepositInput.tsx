import React from 'react';
import { FormControl, FormField, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Control, FieldPath } from 'react-hook-form';
import { z } from 'zod';

export const addDepositFormSchema = z.object({
  principalAmount: z.number().min(0, "Principal amount must be at least 0"),
  tenure: z.number().min(1, "Tenure must be at least 1 year").max(50, "Tenure can't exceed 50 years"),
});

// New CustomInput component for the AddDeposit form
// export const addDepositFormSchema = z.object({
//     principalAmount: z.string()
//       .transform((value) => Number(value)) // Transform string to number
//       .refine((value) => !isNaN(value) && value >= 0, {
//         message: "Principal amount must be at least 0",
//       }),
//     tenure: z.string()
//       .transform((value) => Number(value)) // Transform string to number
//       .refine((value) => !isNaN(value) && value >= 1 && value <= 50, {
//         message: "Tenure must be between 1 and 50 years",
//       }),
//   });

interface AddDepositInputProps {
  control: Control<z.infer<typeof addDepositFormSchema>>;
  name: FieldPath<z.infer<typeof addDepositFormSchema>>;
  label: string;
  placeholder: string;  
  type? : string; // Optional type (e.g., for numeric inputs)
}

const AddDepositInput: React.FC<AddDepositInputProps> = ({ control, name, label, placeholder,type="textx"}) => {
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

export default AddDepositInput;
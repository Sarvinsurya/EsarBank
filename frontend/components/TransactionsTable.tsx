import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { transactionCategoryStyles } from "@/constants"
import { cn, formatAmount, formatDateTime, getTransactionStatus, removeSpecialCharacters } from "@/lib/utils";

interface Transaction {
  transactionId: string;
  senderAccountNumber: string;
  receiverAccountNumber: string;
  amount: number;
  remarks: string;
  status: string;
  transactionTime: string;
  type: 'debit' | 'credit';
}

interface TransactionTableProps {
  transactions: Transaction[];
}

const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  const {
    borderColor,
    backgroundColor,
    textColor,
    chipBackgroundColor,
   } = transactionCategoryStyles[category as keyof typeof transactionCategoryStyles] || transactionCategoryStyles.default
   
  return (
    <div className={cn('category-badge', borderColor, chipBackgroundColor)}>
      <div className={cn('size-2 rounded-full', backgroundColor)} />
      <p className={cn('text-[12px] font-medium', textColor)}>{category}</p>
    </div>
  )
} 


const TransactionsTable = ({ transactions }: TransactionTableProps) => {

  return (
    <Table>
      <TableHeader className="bg-[#f9fafb]">
        <TableRow>
          <TableHead className="px-2">Account Number</TableHead>
          <TableHead className="px-2">Transaction ID </TableHead>
          <TableHead className="px-2">Status</TableHead>
          <TableHead className="px-2">Amount</TableHead>
          <TableHead className="px-2 max-md:hidden">Date & Time</TableHead>
          <TableHead className="px-2 max-md:hidden">Remarks</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((t: Transaction) => {
          const status = getTransactionStatus(new Date(t.transactionTime));
          const amount = formatAmount(t.amount);

          const accountNumber = t.type === 'debit' ? t.receiverAccountNumber : t.senderAccountNumber;
          const isDebit = t.type === 'debit';

          return (
            <TableRow key={t.transactionId} className={`${isDebit || amount[0] === '-' ? 'bg-[#FFFBFA]' : 'bg-[#F6FEF9]'} !over:bg-none !border-b-DEFAULT`}>
              
              

              <TableCell className="max-w-[250px] pl-2 pr-10">
                <div className="flex items-center gap-3">
                  <h1 className="text-14 truncate font-semibold text-[#344054]">
                  {accountNumber}
                  </h1>
                </div>
              </TableCell>

              <TableCell className="max-w-[250px] pl-2 pr-10">
                <div className="flex items-center gap-3">
                  <h1 className="text-14 truncate font-semibold text-[#344054]">
                    {removeSpecialCharacters(t.transactionId)}
                  </h1>
                </div>
              </TableCell>
              

              <TableCell className="pl-2 pr-10">
              <CategoryBadge category={status} /> 
              </TableCell>

              <TableCell className={`pl-2 pr-10 font-semibold ${isDebit || amount[0] === '-' ? 'text-[#f04438]' : 'text-[#039855]'}`}>
                {isDebit ? `-${amount}` : amount}
              </TableCell>

              <TableCell className="min-w-32 pl-2 pr-10">
                {formatDateTime(new Date(t.transactionTime)).dateTime}
              </TableCell>

              <TableCell className="pl-2 pr-10">
            
                {t.remarks}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default TransactionsTable;

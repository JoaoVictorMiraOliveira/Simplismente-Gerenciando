
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum PaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO YYYY-MM-DD
  type: TransactionType;
  status: PaymentStatus;
  category: string;
  isFixed?: boolean;
}

export interface FinancialSummary {
  currentMonthBalance: number;
  totalIncome: number;
  totalExpense: number;
  payableCurrentMonth: number;
  paidExpenseCurrentMonth: number;
  payableFuture: number;
  fixedExpenses: number;
  variableExpenses: number;
}

import { Transaction, TransactionType, PaymentStatus } from './types';

export const CATEGORIES = [
  'Moradia',
  'Alimentação',
  'Transporte',
  'Salário',
  'Lazer',
  'Saúde',
  'Educação',
  'Investimentos',
  'Outros',
];

// Helper to get today formatted
const today = new Date();
const currentMonthStr = today.toISOString().slice(0, 7); // YYYY-MM

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    description: 'Salário Mensal',
    amount: 5000,
    date: `${currentMonthStr}-05`,
    type: TransactionType.INCOME,
    status: PaymentStatus.PAID,
    category: 'Salário',
  },
  {
    id: '2',
    description: 'Aluguel',
    amount: 1500,
    date: `${currentMonthStr}-10`,
    type: TransactionType.EXPENSE,
    status: PaymentStatus.PENDING,
    category: 'Moradia',
  },
  {
    id: '3',
    description: 'Supermercado',
    amount: 600,
    date: `${currentMonthStr}-15`,
    type: TransactionType.EXPENSE,
    status: PaymentStatus.PAID,
    category: 'Alimentação',
  },
  {
    id: '4',
    description: 'Internet',
    amount: 120,
    date: `${currentMonthStr}-20`,
    type: TransactionType.EXPENSE,
    status: PaymentStatus.PENDING,
    category: 'Moradia',
  },
  {
    id: '5',
    description: 'Freelance Projeto X',
    amount: 1200,
    date: `${currentMonthStr}-25`,
    type: TransactionType.INCOME,
    status: PaymentStatus.PENDING,
    category: 'Salário',
  },
];

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  CalendarClock,
  AlertCircle,
  CheckCircle,
  Lock,
  Zap
} from 'lucide-react';
import { Transaction, TransactionType, PaymentStatus, FinancialSummary } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  currentDate: Date;
  currentTheme: 'light' | 'dark';
}

const COLORS = ['#10B981', '#F43F5E', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

export const Dashboard: React.FC<DashboardProps> = ({ transactions, currentDate, currentTheme }) => {
  const currentMonthStr = currentDate.toISOString().slice(0, 7); // YYYY-MM
  
  // Calculations
  const summary: FinancialSummary = React.useMemo(() => {
    let income = 0;
    let expense = 0;
    let payableCurrent = 0;
    let paidExpenseCurrent = 0;
    let payableFuture = 0;
    let fixed = 0;
    let variable = 0;

    transactions.forEach(t => {
      const isCurrentMonth = t.date.startsWith(currentMonthStr);
      
      // Balance Calc (only paid or pending current month for projection)
      if (isCurrentMonth) {
        if (t.type === TransactionType.INCOME) income += t.amount;
        if (t.type === TransactionType.EXPENSE) {
          expense += t.amount;
          
          if (t.isFixed) {
            fixed += t.amount;
          } else {
            variable += t.amount;
          }

          if (t.status === PaymentStatus.PENDING) {
            payableCurrent += t.amount;
          } else if (t.status === PaymentStatus.PAID) {
            paidExpenseCurrent += t.amount;
          }
        }
      }

      // Accounts Payable Future (Expenses Pending after this month)
      if (t.type === TransactionType.EXPENSE && t.status === PaymentStatus.PENDING) {
        if (t.date > `${currentMonthStr}-31`) {
           payableFuture += t.amount;
        }
      }
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      currentMonthBalance: income - expense,
      payableCurrentMonth: payableCurrent,
      paidExpenseCurrentMonth: paidExpenseCurrent,
      payableFuture: payableFuture,
      fixedExpenses: fixed,
      variableExpenses: variable
    };
  }, [transactions, currentMonthStr]);

  // Chart Data Preparation
  const chartData = React.useMemo(() => {
    const data = [
      { name: 'Receitas', value: summary.totalIncome },
      { name: 'Despesas', value: summary.totalExpense },
    ];
    return data;
  }, [summary]);

  const expenseTypeData = React.useMemo(() => {
    return [
      { name: 'Fixas', value: summary.fixedExpenses },
      { name: 'Variáveis', value: summary.variableExpenses },
    ].filter(d => d.value > 0);
  }, [summary]);

  const categoryData = React.useMemo(() => {
    const map = new Map<string, number>();
    transactions
        .filter(t => t.type === TransactionType.EXPENSE && t.date.startsWith(currentMonthStr))
        .forEach(t => {
            map.set(t.category, (map.get(t.category) || 0) + t.amount);
        });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions, currentMonthStr]);


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Saldo (Mês Atual)</p>
            <h3 className={`text-2xl font-bold mt-1 ${summary.currentMonthBalance >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
              R$ {summary.currentMonthBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className={`p-3 rounded-full ${summary.currentMonthBalance >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
            <DollarSign size={24} />
          </div>
        </div>

        {/* Payable Current Month */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">A Pagar (Mês Atual)</p>
            <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-500">
              R$ {summary.payableCurrentMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            <CalendarClock size={24} />
          </div>
        </div>

        {/* Paid Current Month */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pago (Mês Atual)</p>
            <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-500">
              R$ {summary.paidExpenseCurrentMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
            <CheckCircle size={24} />
          </div>
        </div>

         {/* Payable Future */}
         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">A Pagar (Futuro)</p>
            <h3 className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-500">
              R$ {summary.payableFuture.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* Expense Type Breakdown Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-colors">
             <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full">
                 <Lock size={20} />
             </div>
             <div>
                 <p className="text-sm text-slate-500 dark:text-slate-400">Despesas Fixas</p>
                 <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    R$ {summary.fixedExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                 </p>
             </div>
         </div>
         <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-colors">
             <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full">
                 <Zap size={20} />
             </div>
             <div>
                 <p className="text-sm text-slate-500 dark:text-slate-400">Despesas Variáveis</p>
                 <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    R$ {summary.variableExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                 </p>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 h-80 transition-colors">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Fluxo do Mês</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={currentTheme === 'dark' ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: currentTheme === 'dark' ? '#cbd5e1' : '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: currentTheme === 'dark' ? '#cbd5e1' : '#64748b' }} />
              <Tooltip 
                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#fff',
                  color: currentTheme === 'dark' ? '#fff' : '#000'
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#F43F5E'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 h-80 transition-colors">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Despesas por Categoria</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke={currentTheme === 'dark' ? '#0f172a' : '#fff'}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#fff',
                    color: currentTheme === 'dark' ? '#fff' : '#000'
                  }}
                />
                <Legend wrapperStyle={{ color: currentTheme === 'dark' ? '#cbd5e1' : '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
               <AlertCircle size={32} className="mb-2" />
               <p>Sem despesas registradas neste mês.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

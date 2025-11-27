
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  List, 
  Plus, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Wallet,
  Calendar,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { RecurringTransactionForm } from './components/RecurringTransactionForm';
import { AiAdvisor } from './components/AiAdvisor';
import { CalendarView } from './components/CalendarView';
import { Login } from './components/Login';
import { Transaction, PaymentStatus, TransactionType, User } from './types';
import { INITIAL_TRANSACTIONS } from './constants';

// Simple ID generator replacement
const generateId = () => Math.random().toString(36).substr(2, 9);

type Tab = 'dashboard' | 'transactions' | 'calendar';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRecurringFormOpen, setIsRecurringFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // Theme State with Persistence
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'light';
    }
    return 'light';
  });
  
  // Date State for Dashboard context
  const [currentDate, setCurrentDate] = useState(new Date());

  // Theme Effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Authentication Handlers
  const handleLogin = () => {
    // Simulated User Data
    const mockUser: User = {
      id: 'u1',
      name: 'Usuário Exemplo',
      email: 'usuario@gmail.com',
      photoUrl: 'https://ui-avatars.com/api/?name=Usuario+Exemplo&background=0D8ABC&color=fff'
    };
    setUser(mockUser);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  // Navigation
  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [year, month] = e.target.value.split('-').map(Number);
      setCurrentDate(new Date(year, month - 1, 1));
    }
  };

  // CRUD Operations
  const handleSaveTransaction = (data: Transaction | Omit<Transaction, 'id'>) => {
    if ('id' in data) {
      // Edit
      setTransactions(prev => prev.map(t => t.id === data.id ? data : t));
    } else {
      // Create
      setTransactions(prev => [...prev, { ...data, id: generateId() }]);
    }
    setEditingTransaction(null);
  };

  const handleSaveRecurring = (data: { description: string, amount: number, startDate: string, endDate: string, category: string }) => {
    const newTransactions: Transaction[] = [];
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const dayOfMonth = start.getDate(); // Try to keep the same day

    let current = new Date(start);

    // Loop through months
    while (current <= end) {
      // Ensure we are setting the correct day, handling varying days in month (e.g. 31st vs 28th)
      const year = current.getFullYear();
      const month = current.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const actualDay = Math.min(dayOfMonth, daysInMonth);
      
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(actualDay).padStart(2, '0')}`;

      // Only add if within end range (check precise date)
      if (dateStr <= data.endDate && dateStr >= data.startDate) {
        newTransactions.push({
          id: generateId(),
          description: data.description,
          amount: data.amount,
          date: dateStr,
          type: TransactionType.EXPENSE, // Recurring is usually expense in this context
          status: PaymentStatus.PENDING,
          category: data.category,
          isFixed: true
        });
      }

      // Move to next month
      current.setMonth(current.getMonth() + 1);
    }
    
    setTransactions(prev => [...prev, ...newTransactions]);
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleEditTransaction = (t: Transaction) => {
    setEditingTransaction(t);
    setIsFormOpen(true);
  };

  const handleToggleStatus = (id: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: t.status === PaymentStatus.PAID ? PaymentStatus.PENDING : PaymentStatus.PAID
        };
      }
      return t;
    }));
  };

  const openNewTransaction = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  // Format Month Year
  const currentMonthStr = currentDate.toISOString().slice(0, 7); // YYYY-MM
  const monthYearStr = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Filter transactions for the current month view (List and Calendar)
  const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonthStr));

  // Render Login if no user
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row animate-fade-in transition-colors duration-200">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
          <Wallet className="text-blue-600 dark:text-blue-500" /> Finanças Pro
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600 dark:text-slate-400">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out flex flex-col
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Area */}
        <div className="p-6 flex items-center gap-2 font-bold text-xl text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 hidden md:flex">
          <div className="bg-blue-600 dark:bg-blue-500 p-1.5 rounded-lg text-white">
             <Wallet size={20} /> 
          </div>
          Finanças Pro
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'dashboard' 
                ? 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            onClick={() => { setActiveTab('transactions'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'transactions' 
                ? 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <List size={20} />
            Transações
          </button>
          <button 
            onClick={() => { setActiveTab('calendar'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'calendar' 
                ? 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar size={20} />
            Calendário
          </button>
          
          <div className="pt-4 mt-2">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Saldo Total Acumulado</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                R$ {transactions
                  .reduce((acc, t) => {
                     if (t.status === PaymentStatus.PAID) {
                       return acc + (t.type === TransactionType.INCOME ? t.amount : -t.amount);
                     }
                     return acc;
                  }, 0)
                  .toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                }
              </p>
            </div>
          </div>
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            {theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
          </button>

          <div className="flex items-center gap-3 pt-2">
            <img 
               src={user.photoUrl} 
               alt={user.name} 
               className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-700 py-2 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
          >
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          
          <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 w-fit">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
              <ChevronLeft size={20} />
            </button>
            
            <div className="relative">
              <span className="text-slate-800 dark:text-slate-100 font-semibold min-w-[140px] text-center capitalize block cursor-pointer px-2">
                {monthYearStr}
              </span>
              <input 
                type="month" 
                value={currentMonthStr}
                onChange={handleDateSelect}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Selecionar mês e ano"
              />
            </div>

            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
              <ChevronRight size={20} />
            </button>
          </div>

          <button 
            onClick={openNewTransaction}
            className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            Nova Transação
          </button>
        </div>

        {/* Dynamic Content */}
        <div className="space-y-8">
          
          {/* Always show AI Advisor on dashboard for easy access */}
          {activeTab === 'dashboard' && (
            <AiAdvisor transactions={transactions} currentDate={currentDate} />
          )}

          {activeTab === 'dashboard' ? (
            <Dashboard transactions={transactions} currentDate={currentDate} currentTheme={theme} />
          ) : activeTab === 'transactions' ? (
             <TransactionList 
               transactions={currentMonthTransactions} 
               onDelete={handleDeleteTransaction}
               onEdit={handleEditTransaction}
               onToggleStatus={handleToggleStatus}
               onOpenRecurring={() => setIsRecurringFormOpen(true)}
             />
          ) : (
            <CalendarView transactions={transactions} currentDate={currentDate} />
          )}
        </div>
      </main>

      {/* Modal Single Transaction */}
      <TransactionForm 
        isOpen={isFormOpen} 
        onClose={() => { setIsFormOpen(false); setEditingTransaction(null); }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
      />

      {/* Modal Recurring Transaction */}
      <RecurringTransactionForm
        isOpen={isRecurringFormOpen}
        onClose={() => setIsRecurringFormOpen(false)}
        onSave={handleSaveRecurring}
      />

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;

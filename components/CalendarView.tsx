
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, PaymentStatus } from '../types';
import { AlertCircle, X, CheckCircle, Clock, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface CalendarViewProps {
  transactions: Transaction[];
  currentDate: Date;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ transactions, currentDate }) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calendar logic
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

  const getTransactionsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return transactions.filter(t => t.date === dateStr);
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Organize days into weeks
  const weeks = useMemo(() => {
    const allWeeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];

    // Initial padding
    for (let i = 0; i < firstDayOfMonth; i++) {
      currentWeek.push(null);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        allWeeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Final padding
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      allWeeks.push(currentWeek);
    }
    return allWeeks;
  }, [year, month, daysInMonth, firstDayOfMonth]);

  // Modal Data
  const selectedTransactions = selectedDay ? getTransactionsForDay(selectedDay) : [];
  const selectedDateDisplay = selectedDay 
    ? new Date(year, month, selectedDay).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const getWeeklySummary = (weekDays: (number | null)[]) => {
    let income = 0;
    let expense = 0;
    weekDays.forEach(day => {
        if (day) {
            const txs = getTransactionsForDay(day);
            txs.forEach(t => {
                if (t.type === TransactionType.INCOME) income += t.amount;
                if (t.type === TransactionType.EXPENSE) expense += t.amount;
            });
        }
    });
    return { income, expense };
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden animate-fade-in transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Calendário de Pagamentos</h3>
           <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-slate-600 dark:text-slate-400">A Pagar</span>
              </div>
              <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-600 dark:text-slate-400">Receita</span>
              </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                  <span className="text-slate-600 dark:text-slate-400">Pago</span>
              </div>
          </div>
        </div>

        {/* Header Days */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
           <div className="flex-1 grid grid-cols-7">
            {weekDays.map(d => (
                <div key={d} className="py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {d}
                </div>
            ))}
           </div>
           {/* Header for Summary Column */}
           <div className="w-32 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-l border-slate-200 dark:border-slate-700">
             Resumo Semanal
           </div>
        </div>

        {/* Weeks Rows */}
        <div className="flex flex-col bg-slate-100 dark:bg-slate-800 gap-px border-b border-slate-100 dark:border-slate-800">
           {weeks.map((week, wIdx) => {
               const { income, expense } = getWeeklySummary(week);

               return (
                   <div key={wIdx} className="flex bg-white dark:bg-slate-900 min-h-[120px]">
                        {/* Days Grid */}
                       <div className="flex-1 grid grid-cols-7 divide-x divide-slate-100 dark:divide-slate-800">
                           {week.map((day, dIdx) => {
                               if (!day) return <div key={dIdx} className="bg-slate-50/30 dark:bg-slate-800/30" />;
                               
                               const dayTransactions = getTransactionsForDay(day);
                               const isToday = 
                                    new Date().getDate() === day && 
                                    new Date().getMonth() === month && 
                                    new Date().getFullYear() === year;
                               
                               const hasPending = dayTransactions.some(t => t.type === TransactionType.EXPENSE && t.status === PaymentStatus.PENDING);

                               return (
                                <div 
                                    key={dIdx} 
                                    onClick={() => setSelectedDay(day)}
                                    className={`relative p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                    <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {day}
                                    </span>
                                    {hasPending && (
                                        <AlertCircle size={14} className="text-amber-500" />
                                    )}
                                    </div>

                                    <div className="space-y-1">
                                    {dayTransactions.map(t => (
                                        <div 
                                        key={t.id} 
                                        className={`text-[10px] py-1 px-1.5 rounded border text-center font-semibold shadow-sm truncate ${
                                            t.type === TransactionType.INCOME
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                                            : t.status === PaymentStatus.PAID
                                                ? 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 decoration-slate-400' 
                                                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                                        }`}
                                        >
                                            {t.type === TransactionType.EXPENSE ? '- ' : '+ '}
                                            R$ {Math.round(t.amount)}
                                        </div>
                                    ))}
                                    </div>
                                </div>
                               );
                           })}
                       </div>

                       {/* Weekly Summary Column */}
                       <div className="w-32 flex flex-col justify-center gap-2 px-3 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-l border-slate-200 dark:border-slate-700 text-xs">
                            <div className="flex flex-col">
                                <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Receitas</span>
                                <span className="text-emerald-600 dark:text-emerald-500 font-bold text-sm">
                                    R$ {income.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Despesas</span>
                                <span className="text-rose-600 dark:text-rose-500 font-bold text-sm">
                                    R$ {expense.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </span>
                            </div>
                            <div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Saldo:</span>
                                <span className={`font-bold ${(income - expense) >= 0 ? 'text-slate-700 dark:text-slate-300' : 'text-rose-600 dark:text-rose-500'}`}>
                                    { (income - expense).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }
                                </span>
                            </div>
                       </div>
                   </div>
               )
           })}
        </div>
      </div>

      {/* Details Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedDay(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                 <Clock size={18} className="text-slate-500 dark:text-slate-400" />
                 {selectedDateDisplay}
              </h3>
              <button 
                onClick={() => setSelectedDay(null)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {selectedTransactions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  Nenhuma transação neste dia.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedTransactions.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          t.type === TransactionType.INCOME ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                        }`}>
                          {t.type === TransactionType.INCOME ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">{t.description}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{t.category}</span>
                            {t.status === PaymentStatus.PAID ? (
                               <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle size={10} /> Pago</span>
                            ) : (
                               <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1"><Clock size={10} /> Pendente</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={`font-semibold ${t.type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                         {t.type === TransactionType.EXPENSE ? '- ' : '+ '}
                         R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
             <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-right">
                <button 
                   onClick={() => setSelectedDay(null)}
                   className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                >
                   Fechar
                </button>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

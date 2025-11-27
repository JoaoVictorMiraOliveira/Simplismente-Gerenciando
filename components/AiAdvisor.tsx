
import React, { useState } from 'react';
import { Transaction } from '../types';
import { analyzeFinances } from '../services/geminiService';
import { Sparkles, Loader2, MessageSquareQuote } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AiAdvisorProps {
  transactions: Transaction[];
  currentDate: Date;
}

export const AiAdvisor: React.FC<AiAdvisorProps> = ({ transactions, currentDate }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const monthStr = currentDate.toISOString().slice(0, 7);
    
    // Filter transactions relevant to recent history + future
    const recentTransactions = transactions.filter(t => {
       const tDate = t.date;
       // Take last month, current month, next month roughly
       return tDate >= '2023-01-01'; // Simplified for demo, grab all context
    });

    const result = await analyzeFinances(recentTransactions, monthStr);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-indigo-950/30 rounded-xl border border-blue-100 dark:border-indigo-900/50 p-6 shadow-sm transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
            <Sparkles className="text-indigo-600 dark:text-indigo-400" size={20} />
            Consultor IA
          </h3>
          <p className="text-sm text-indigo-700 dark:text-indigo-400/80 mt-1">
            Receba insights inteligentes sobre seu fluxo de caixa e hábitos de consumo.
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading || transactions.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-sm"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Analisando...
            </>
          ) : (
            'Gerar Análise'
          )}
        </button>
      </div>

      {analysis && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-indigo-100 dark:border-slate-700 animate-fade-in shadow-sm">
           <div className="flex gap-3">
             <div className="mt-1 min-w-[20px]">
               <MessageSquareQuote className="text-indigo-400" size={24} />
             </div>
             <div className="prose prose-indigo dark:prose-invert prose-sm w-full max-w-none text-slate-700 dark:text-slate-300">
               <ReactMarkdown>{analysis}</ReactMarkdown>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';

// =========================================================================
// 📁 src/components/SummaryCards.jsx
// =========================================================================
function SummaryCards({ totalExpense, transactionCount, totalRecurringExpense, recurringCount }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-slate-700">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-emerald-600/80"></div>
        <div aria-hidden="true" className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl"></div>
        <div className="text-xs font-medium text-slate-400 tracking-wider uppercase mb-1">
          本月總開支 (TOTAL)
        </div>
        <div className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
          HK$ {totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-3 text-xs text-slate-500 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          共 {transactionCount} 筆明細紀錄
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-slate-700">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-indigo-600/80"></div>
        <div aria-hidden="true" className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-indigo-500/10 blur-2xl"></div>
        <div className="text-xs font-medium text-slate-400 tracking-wider uppercase mb-1">
          折合每月固定恆常開支
        </div>
        <div className="text-3xl font-extrabold text-indigo-300 tracking-tight tabular-nums">
          HK$ {totalRecurringExpense.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
        <div className="mt-3 text-xs text-indigo-400/80 flex items-center gap-2">
          <span>{recurringCount} 個預定訂閱/恆常項目</span>
        </div>
      </div>
    </div>
  );
}

export default SummaryCards;
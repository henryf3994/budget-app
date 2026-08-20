import React from 'react';
import { ReceiptText, Repeat2 } from 'lucide-react';

// =========================================================================
// 📁 src/components/SummaryCards.jsx
// =========================================================================
function SummaryCards({ totalExpense, transactionCount, totalRecurringExpense, recurringCount }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="pixel-card p-5 relative overflow-hidden transition-transform hover:-translate-y-0.5">
        <div className="absolute top-0 left-0 w-1 h-full bg-success"></div>
        <div className="flex items-start justify-between gap-3">
          <div className="text-xs font-semibold text-ink-soft tracking-wider uppercase mb-1">
            本月總開支 <span className="text-muted">/ Total</span>
          </div>
          <div className="p-2 rounded-pixel-sm bg-green-50 border-2 border-success text-success"><ReceiptText className="w-4 h-4" /></div>
        </div>
        <div className="pixel-number font-pixel text-pixel-xl text-ink tracking-tight tabular-nums">
          HK$ {totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-3 text-xs text-muted flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-success"></span>
          共 {transactionCount} 筆明細紀錄
        </div>
      </div>

      <div className="pixel-card p-5 relative overflow-hidden transition-transform hover:-translate-y-0.5">
        <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
        <div className="flex items-start justify-between gap-3">
          <div className="text-xs font-semibold text-ink-soft tracking-wider uppercase mb-1">
            每月固定恆常開支
          </div>
          <div className="p-2 rounded-pixel-sm bg-yellow-50 border-2 border-accent-dark text-accent-dark"><Repeat2 className="w-4 h-4" /></div>
        </div>
        <div className="pixel-number font-pixel text-pixel-xl text-ink tracking-tight tabular-nums">
          HK$ {totalRecurringExpense.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
        <div className="mt-3 text-xs text-muted flex items-center gap-2">
          <span>{recurringCount} 個預定訂閱/恆常項目</span>
        </div>
      </div>
    </div>
  );
}

export default SummaryCards;

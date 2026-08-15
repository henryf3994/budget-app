
import React from 'react';
import { X, FileText, Edit3, Trash2 } from 'lucide-react';
import { getPayerStyle, getPaymentMethodStyle } from '../utils/constants.js';

// =========================================================================
// 📁 src/components/TransactionList.jsx
// =========================================================================
function TransactionList({ transactions, categories, selectedCategoryFilter, onCategoryFilterChange, searchQuery, onSearchChange, onEdit, onDelete }) {
  const getCategoryColor = (catName) => {
    const found = categories.find(c => c.name === catName);
    return found ? found.color : '#8b5cf6';
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          支出明細列表
          {selectedCategoryFilter !== 'ALL' && (
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full flex items-center gap-1">
              {selectedCategoryFilter}
              <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => onCategoryFilterChange('ALL')} />
            </span>
          )}
        </h3>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input 
            type="text"
            placeholder="搜尋項目/付款人/備註..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full sm:w-64 bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          />
          <select
            value={selectedCategoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">所有類別</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="divide-y divide-slate-800/60">
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <FileText className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-sm font-medium">當月暫無相關記錄</p>
            <p className="text-xs text-slate-600 max-w-xs">點擊上方「新增記帳」開始記錄，或切換月份瀏覽其他紀錄</p>
          </div>
        ) : (
          transactions.map((item, idx) => {
            const catColor = getCategoryColor(item.category);
            const payerBadgeClass = getPayerStyle(item.payer, 'badge');
            const paymentMethodBadgeClass = getPaymentMethodStyle(item.paymentMethod, 'badge');
            return (
              <div key={item.id || idx} className="p-4 hover:bg-slate-800/40 transition-colors border-l-2 border-l-transparent hover:border-l-emerald-500/70 flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3.5">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: catColor }} />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-white">{item.title}</span>
                      {item.payer && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${payerBadgeClass}`}>
                          {item.payer}
                        </span>
                      )}
                      {item.paymentMethod && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${paymentMethodBadgeClass}`}>
                          {item.paymentMethod}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span className="tabular-nums">{item.date}</span>
                      <span>•</span>
                      <span>{item.category || '其他'}</span>
                      {item.note && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400 italic">{item.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-100 tabular-nums">
                      - HK$ {(Number.isFinite(Number(item.amount)) ? Number(item.amount) : 0).toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 border-l border-slate-800 pl-3">
                    <button 
                      onClick={() => onEdit(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
                      title="編輯"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="刪除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default TransactionList;

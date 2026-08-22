
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
    <div className="pixel-card bg-surface overflow-hidden">
      <div className="p-4 sm:p-5 border-b-2 border-ink flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-ink flex items-center gap-2">
          支出明細列表
          {selectedCategoryFilter !== 'ALL' && (
            <span className="text-xs bg-accent border-2 border-ink text-ink px-2 py-0.5 rounded-pixel-sm flex items-center gap-1">
              {selectedCategoryFilter}
              <X className="w-3 h-3 cursor-pointer hover:text-primary-dark" onClick={() => onCategoryFilterChange('ALL')} />
            </span>
          )}
        </h3>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="pixel-border-sm relative flex-1 p-0.5">
            <input
            type="text"
            placeholder="搜尋項目/付款人/備註..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="relative z-0 w-full sm:w-64 bg-surface-soft border-0 rounded-none text-ink text-sm pl-3 pr-3 py-2 focus:outline-none focus:border-primary"
          />
          </div>
          <div className="pixel-border-sm p-0.5">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="relative z-0 w-full bg-surface-soft border-0 rounded-none text-ink text-sm px-3 py-2 focus:outline-none focus:border-primary"
            >
              <option value="ALL">所有類別</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y-2 divide-ink/10">
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-muted flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-pixel-card bg-surface-warm border-2 border-ink flex items-center justify-center shadow-pixel-sm">
              <FileText className="w-8 h-8 text-primary-dark" />
            </div>
            <p className="text-sm font-medium">當月暫無相關記錄</p>
            <p className="text-xs text-ink-soft max-w-xs">點擊上方「新增記帳」開始記錄，或切換月份瀏覽其他紀錄</p>
          </div>
        ) : (
          transactions.map((item, idx) => {
            const catColor = getCategoryColor(item.category);
            return (
              <div key={item.id || idx} className="transaction-row relative p-4 pl-6 hover:bg-surface-warm transition-colors flex flex-col gap-2">
                <div aria-hidden="true" className="expense-indicator transaction-expense-indicator absolute inset-y-0 left-0" style={{ backgroundColor: catColor }} />
                <div className="flex items-center justify-between gap-3 min-w-0">
                  <div className="flex items-center flex-wrap gap-1.5 min-w-0">
                    <span className="text-xl font-semibold text-ink break-words">{item.title}</span>
                    <span className="transaction-category-name text-base font-semibold" style={{ color: catColor }}>
                      {item.category || '其他'}
                    </span>
                  </div>
                  <span className="text-xl text-muted tabular-nums whitespace-nowrap shrink-0">{item.date}</span>
                </div>

                <div className="flex items-center justify-between gap-3 ml-0">
                  <div className="text-xs text-muted flex items-center flex-wrap gap-x-2 gap-y-0.5 min-w-0">
                      {item.payer && (
                        <span className={`pixel-border-sm text-base px-1.5 py-0.2 rounded-pixel-sm font-medium ${getPayerStyle(item.payer, 'button')}`}>
                          {item.payer}
                        </span>
                      )}
                      {item.paymentMethod && (
                        <span className={`pixel-border-sm text-base px-1.5 py-0.2 rounded-pixel-sm font-medium ${getPaymentMethodStyle(item.paymentMethod, 'button')}`}>
                          {item.paymentMethod}
                        </span>
                      )}
                      {item.note && (
                        <>
                          <span>•</span>
                          <span className="text-ink-soft italic break-all">{item.note}</span>
                        </>
                      )}
                  </div>

                <div className="flex items-center justify-end gap-3 shrink-0">
                  <div className="font-pixel text-pixel-lg text-ink text-left tabular-nums break-words">
                    - HK$ {(Number.isFinite(Number(item.amount)) ? Number(item.amount) : 0).toFixed(2)}
                  </div>

                  <div className="flex items-center space-x-1 border-l-2 border-ink/20 pl-3">
                    <button
                      onClick={() => onEdit(item)}
                      className="transaction-action-button p-1.5 rounded-pixel-sm text-ink-soft"
                      title="編輯"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="transaction-action-button transaction-delete-button p-1.5 rounded-pixel-sm text-danger"
                      title="刪除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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

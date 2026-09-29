import { useMemo } from 'react';
import { X, Plus, RefreshCw, Edit3, Trash2 } from 'lucide-react';
import {
  DEFAULT_CATEGORY_NAME,
  getPayerStyle,
  getPaymentMethodStyle,
  CATEGORY_FILTER_ALL
} from '../utils/constants.js';
import { buildCategoryColorMap, formatMoney, getCategoryColorFromMap } from '../utils/listHelpers.js';

// =========================================================================
// 📁 src/components/RecurringExpenseList.jsx
// 恆常開支列表 — 視覺與交易明細列表（TransactionList）一致，
// 並提供相同的搜尋列與類別篩選。
// =========================================================================
function RecurringExpenseList({
  recurringExpenses,
  categories,
  selectedCategoryFilter,
  onCategoryFilterChange,
  searchQuery,
  onSearchChange,
  onEdit,
  onDelete,
  onAdd
}) {
  const categoryColorById = useMemo(() => buildCategoryColorMap(categories), [categories]);

  return (
    <div className="pixel-card bg-surface overflow-hidden">
      <div className="p-4 sm:p-5 border-b-2 border-ink flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center flex-wrap gap-2 min-w-0">
          <h3 className="text-lg font-bold text-ink flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary-dark" />
            恆常開支列表
            {selectedCategoryFilter !== CATEGORY_FILTER_ALL && (
              <span className="text-xs bg-accent border-2 border-ink text-ink px-2 py-0.5 rounded-pixel-sm flex items-center gap-1">
                {selectedCategoryFilter}
                <button
                  type="button"
                  aria-label="清除類別篩選"
                  className="w-3 h-3 cursor-pointer hover:text-primary-dark"
                  onClick={() => onCategoryFilterChange(CATEGORY_FILTER_ALL)}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </h3>
          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent border-2 border-ink text-ink text-xs font-bold shadow-pixel-sm transition-transform hover:-translate-y-0.5"
            >
              <Plus className="w-3.5 h-3.5" />
              新增恆常開支
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="pixel-border-sm relative flex-1 p-0.5">
            <input
              type="text"
              placeholder="搜尋項目/付款人/備註..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="relative z-0 w-full sm:w-64 bg-surface-soft border-0 rounded-none text-ink text-sm pl-3 pr-3 py-2 focus:outline-none focus:border-primary"
            />
          </div>
          <div className="pixel-border-sm p-0.5">
            <select
              value={selectedCategoryFilter}
              onChange={e => onCategoryFilterChange(e.target.value)}
              className="relative z-0 w-full bg-surface-soft border-0 rounded-none text-ink text-sm px-3 py-2 focus:outline-none focus:border-primary"
            >
              <option value={CATEGORY_FILTER_ALL}>所有類別</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y-2 divide-ink/10">
        {recurringExpenses.length === 0 ? (
          <div className="p-12 text-center text-muted flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-pixel-card bg-surface-warm border-2 border-ink flex items-center justify-center shadow-pixel-sm">
              <RefreshCw className="w-8 h-8 text-primary-dark" />
            </div>
            <p className="text-sm font-medium text-ink-soft max-w-xs">
              目前沒有恆常開支，點擊右上角「新增恆常開支」或總覽的「恆常開支」按鈕開始設定
            </p>
          </div>
        ) : (
          recurringExpenses.map((item, idx) => {
            const catColor = getCategoryColorFromMap(categoryColorById, item.category);
            return (
              <div
                key={item.id || idx}
                className="transaction-row relative p-4 pl-6 hover:bg-surface-warm transition-colors flex flex-col gap-2"
              >
                <div
                  aria-hidden="true"
                  className="expense-indicator transaction-expense-indicator absolute inset-y-0 left-0"
                  style={{ backgroundColor: catColor }}
                />
                <div className="flex items-center justify-between gap-3 min-w-0">
                  <div className="flex items-center flex-wrap gap-1.5 min-w-0">
                    <span className="text-xl font-semibold text-ink break-words">{item.title}</span>
                    <span className="transaction-category-name text-base font-semibold" style={{ color: catColor }}>
                      {item.category || DEFAULT_CATEGORY_NAME}
                    </span>
                  </div>
                  <span className="text-xl text-muted tabular-nums whitespace-nowrap shrink-0">
                    每月 {item.dayOfMonth} 號
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-muted flex items-center flex-wrap gap-x-2 gap-y-0.5 min-w-0">
                    {item.payer && (
                      <span
                        className={`pixel-border-sm text-base px-1.5 py-0.2 rounded-pixel-sm font-medium ${getPayerStyle(item.payer, 'button')}`}
                      >
                        {item.payer}
                      </span>
                    )}
                    {item.paymentMethod && (
                      <span
                        className={`pixel-border-sm text-base px-1.5 py-0.2 rounded-pixel-sm font-medium ${getPaymentMethodStyle(item.paymentMethod, 'button')}`}
                      >
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
                      - HK$ {formatMoney(item.amount, 2, 2)}
                    </div>

                    <div className="flex items-center space-x-1 border-l-2 border-ink/20 pl-3">
                      <button
                        onClick={() => onEdit(item)}
                        className="transaction-action-button p-1.5 rounded-pixel-sm text-ink-soft"
                        type="button"
                        aria-label="編輯"
                        title="編輯"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="transaction-action-button transaction-delete-button p-1.5 rounded-pixel-sm text-danger"
                        type="button"
                        aria-label="刪除"
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

export default RecurringExpenseList;

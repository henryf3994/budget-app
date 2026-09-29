import { useMemo } from 'react';
import { CATEGORY_FILTER_ALL } from '../utils/constants.js';
import { HEALTH_BAR_CELL_COUNT, getHealthBarCells, normalizePercentages } from '../utils/categoryMath.js';

// =========================================================================
// 📁 src/components/CategoryBreakdown.jsx
// =========================================================================

function CategoryBreakdown({ breakdownData, selectedCategoryFilter, onCategoryFilterChange }) {
  // 以 useMemo 固定陣列參考，避免 fallback 陣列每次 render 都變動而使下游 memo 失效
  const items = useMemo(() => (Array.isArray(breakdownData) ? breakdownData : []), [breakdownData]);
  const normalizedBreakdown = useMemo(() => normalizePercentages(items), [items]);
  const healthBarCells = useMemo(() => getHealthBarCells(normalizedBreakdown), [normalizedBreakdown]);

  // 點擊已選取的分類時取消篩選，否則切換到該分類
  const toggleSelection = name => onCategoryFilterChange(selectedCategoryFilter === name ? CATEGORY_FILTER_ALL : name);

  return (
    <div className="pixel-card p-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-ink">開支類別比例</h2>
        <span className="text-xs text-muted">點擊分類可篩選明細</span>
      </div>

      {/* 📊 Horizontal Stacked Percentage Bar */}
      <div
        className="pixel-health-bar w-full h-8 bg-surface-warm border-2 border-ink overflow-hidden mb-5"
        aria-label="Category breakdown health bar"
      >
        <div className="w-full h-full flex">
          {Array.from({ length: HEALTH_BAR_CELL_COUNT }, (_, cellIndex) => {
            const cell = healthBarCells[cellIndex];
            const cat = cell?.category;
            const isSelected = cat && selectedCategoryFilter === cat.name;
            const hasSelection = selectedCategoryFilter !== CATEGORY_FILTER_ALL;

            return (
              <div
                key={`bar-cell-${cellIndex}`}
                onClick={() => cat && toggleSelection(cat.name)}
                style={cat ? { backgroundColor: cat.color } : undefined}
                title={
                  cat ? `${cat.name}: ${cat.percentage}% (HK$ ${(Number(cat.total) || 0).toLocaleString()})` : undefined
                }
                className={`pixel-health-cell ${cat ? 'pixel-health-cell--filled cursor-pointer' : 'pixel-health-cell--empty'} ${
                  hasSelection && isSelected ? 'pixel-health-cell--selected' : ''
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Category Cards Grid：lg 斷點對齊預設 8 個類別，讓預設類別在寬螢幕排成一列 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {items.map(cat => {
          const isSelected = selectedCategoryFilter === cat.name;

          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => toggleSelection(cat.name)}
              className={`pixel-border-sm p-3 text-left transition-all min-w-0 ${
                isSelected ? 'bg-surface-warm shadow-pixel-sm' : 'bg-surface-soft hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-pixel-sm border border-ink shrink-0"
                  style={{ backgroundColor: cat.color }}
                ></span>
                <span className="text-sm font-medium text-ink-soft whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
                  {cat.name}
                </span>
              </div>
              <div className="font-pixel text-pixel-lg text-ink whitespace-nowrap shrink-0 tabular-nums">
                HK$ {(Number(cat.total) || 0).toLocaleString()}
              </div>
              <div className="text-xs font-semibold text-muted mt-1 whitespace-nowrap shrink-0 tabular-nums">
                {cat.percentage}%
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryBreakdown;

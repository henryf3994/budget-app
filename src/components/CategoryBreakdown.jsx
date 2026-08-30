import { useMemo } from 'react';
import { CATEGORY_FILTER_ALL } from '../utils/constants.js';

// =========================================================================
// 📁 src/components/CategoryBreakdown.jsx
// =========================================================================
const HEALTH_BAR_CELL_COUNT = 20;

// 百分比總和可能因四捨五入而不等於 100%，讓「最後一項」吸收剩下的
// 寬度，確保整個進度條剛好填滿。O(n) 單次累加，取代在 map 內重複 reduce。
function normalizePercentages(items) {
  const percentages = items.map(item => Number(item.percentage || 0));
  const totalRounded = percentages.reduce((sum, value) => sum + value, 0);
  let previousTotal = 0;

  return items.map((item, index) => {
    const isLast = index === items.length - 1;
    let widthPercent = percentages[index];
    if (totalRounded > 0 && isLast) {
      widthPercent = Math.max(0, 100 - previousTotal);
    }
    previousTotal += percentages[index];
    return { ...item, widthPercent };
  });
}

function getHealthBarCells(breakdown) {
  const totalWidth = breakdown.reduce((sum, cat) => sum + Math.max(0, cat.widthPercent), 0);
  if (totalWidth === 0) return [];

  const allocations = breakdown.map((cat) => {
    const exactCells = totalWidth > 0
      ? (Math.max(0, cat.widthPercent) / totalWidth) * HEALTH_BAR_CELL_COUNT
      : 0;

    return {
      exactCells,
      cells: Math.floor(exactCells),
      remainder: exactCells - Math.floor(exactCells),
    };
  });

  let remainingCells = HEALTH_BAR_CELL_COUNT - allocations.reduce((sum, item) => sum + item.cells, 0);
  const byRemainder = allocations
    .map((item, index) => ({ ...item, index }))
    .sort((first, second) => second.remainder - first.remainder || first.index - second.index);

  byRemainder.forEach((item) => {
    if (remainingCells > 0) {
      allocations[item.index].cells += 1;
      remainingCells -= 1;
    }
  });

  return allocations.flatMap((allocation, categoryIndex) => (
    Array.from({ length: allocation.cells }, () => ({
      category: breakdown[categoryIndex],
    }))
  ));
}

function CategoryBreakdown({ breakdownData, selectedCategoryFilter, onCategoryFilterChange }) {
  const items = Array.isArray(breakdownData) ? breakdownData : [];
  const normalizedBreakdown = useMemo(() => normalizePercentages(items), [items]);
  const healthBarCells = useMemo(() => getHealthBarCells(normalizedBreakdown), [normalizedBreakdown]);

  // 點擊已選取的分類時取消篩選，否則切換到該分類
  const toggleSelection = (name) => onCategoryFilterChange(
    selectedCategoryFilter === name ? CATEGORY_FILTER_ALL : name
  );

  return (
    <div className="pixel-card p-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-ink">開支類別比例</h2>
        <span className="text-xs text-muted">點擊分類可篩選明細</span>
      </div>

      {/* 📊 Horizontal Stacked Percentage Bar */}
      <div className="pixel-health-bar w-full h-8 bg-surface-warm border-2 border-ink overflow-hidden mb-5" aria-label="Category breakdown health bar">
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
                title={cat ? `${cat.name}: ${cat.percentage}% (HK$ ${(Number(cat.total) || 0).toLocaleString()})` : undefined}
                className={`pixel-health-cell ${cat ? 'pixel-health-cell--filled cursor-pointer' : 'pixel-health-cell--empty'} ${
                  hasSelection && isSelected ? 'pixel-health-cell--selected' : ''
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {items.map((cat) => {
          const isSelected = selectedCategoryFilter === cat.name;

          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => toggleSelection(cat.name)}
              className={`pixel-border-sm p-3 text-left transition-all min-w-0 ${
                isSelected
                  ? 'bg-surface-warm shadow-pixel-sm'
                  : 'bg-surface-soft hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-pixel-sm border border-ink shrink-0" style={{ backgroundColor: cat.color }}></span>
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

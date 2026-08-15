import React from 'react';

// =========================================================================
// 📁 src/components/CategoryBreakdown.jsx
// =========================================================================
function CategoryBreakdown({ breakdownData, selectedCategoryFilter, onCategoryFilterChange }) {
  const normalizedBreakdown = breakdownData.map((cat, index, array) => {
    const totalRounded = array.reduce((sum, item) => sum + Number(item.percentage || 0), 0);
    const isLast = index === array.length - 1;
    const previousTotal = array
      .slice(0, index)
      .reduce((sum, item) => sum + Number(item.percentage || 0), 0);

    const widthPercent = totalRounded > 0 && isLast
      ? Math.max(0, 100 - previousTotal)
      : Number(cat.percentage || 0);

    return { ...cat, widthPercent };
  });

  return (
    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <h2 className="text-base font-semibold text-white mb-4 flex items-center justify-between">
        <span>開支類別比例 (Category Breakdown)</span>
        <span className="text-xs text-slate-500 font-normal">點擊下方分類可快速篩選列表</span>
      </h2>

      {/* 📊 Horizontal Stacked Percentage Bar */}
      <div className="w-full h-6 bg-slate-950/60 rounded-full border-[1.5px] border-slate-700/80 overflow-hidden mb-5">
        <div className="w-full h-full flex overflow-hidden rounded-full">
          {normalizedBreakdown.map((cat) => {
            const isSelected = selectedCategoryFilter === cat.id;
            const hasSelection = selectedCategoryFilter !== 'ALL';

            return (
              <div
                key={`bar-${cat.id}`}
                onClick={() => onCategoryFilterChange(isSelected ? 'ALL' : cat.id)}
                style={{
                  width: `${cat.widthPercent}%`,
                  backgroundColor: cat.color,
                }}
                title={`${cat.name}: ${cat.percentage}% (HK$ ${(Number(cat.total) || 0).toLocaleString()})`}
                className={`h-full cursor-pointer transition-all duration-200 first:rounded-l-full last:rounded-r-full hover:opacity-100 hover:brightness-125 ${
                  hasSelection && !isSelected ? 'opacity-30' : 'opacity-90'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {breakdownData.map((cat) => {
          const isSelected = selectedCategoryFilter === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onCategoryFilterChange(isSelected ? 'ALL' : cat.id)}
              className={`p-3 rounded-xl border text-left transition-all min-w-0 ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500'
                  : 'border-slate-800/80 bg-slate-950/40 hover:border-indigo-500/40 hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                <span className="text-[1.2rem] font-medium text-slate-300 whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
                  {cat.name}
                </span>
              </div>
              <div className="text-[1rem] font-bold text-white whitespace-nowrap shrink-0 tabular-nums">
                HK$ {(Number(cat.total) || 0).toLocaleString()}
              </div>
              <div className="text-[1rem] font-bold text-slate-300 mt-1 whitespace-nowrap shrink-0 tabular-nums">
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

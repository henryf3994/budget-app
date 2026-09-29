// =========================================================================
// 📁 src/utils/categoryMath.js (類別比例圖表的純計算)
// =========================================================================
// 這些函數原本內嵌在 CategoryBreakdown.jsx，抽出來與 React 無關，
// 可直接單元測試（見 categoryMath.test.js）。

export const HEALTH_BAR_CELL_COUNT = 20;

// 百分比總和可能因四捨五入而不等於 100%，讓「最後一項」吸收剩下的
// 寬度，確保整個進度條剛好填滿。O(n) 單次累加，取代在 map 內重複 reduce。
export function normalizePercentages(items) {
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

export function getHealthBarCells(breakdown) {
  const totalWidth = breakdown.reduce((sum, cat) => sum + Math.max(0, cat.widthPercent), 0);
  if (totalWidth === 0) return [];

  const allocations = breakdown.map(cat => {
    const exactCells = totalWidth > 0 ? (Math.max(0, cat.widthPercent) / totalWidth) * HEALTH_BAR_CELL_COUNT : 0;

    return {
      exactCells,
      cells: Math.floor(exactCells),
      remainder: exactCells - Math.floor(exactCells)
    };
  });

  let remainingCells = HEALTH_BAR_CELL_COUNT - allocations.reduce((sum, item) => sum + item.cells, 0);
  const byRemainder = allocations
    .map((item, index) => ({ ...item, index }))
    .sort((first, second) => second.remainder - first.remainder || first.index - second.index);

  byRemainder.forEach(item => {
    if (remainingCells > 0) {
      allocations[item.index].cells += 1;
      remainingCells -= 1;
    }
  });

  return allocations.flatMap((allocation, categoryIndex) =>
    Array.from({ length: allocation.cells }, () => ({
      category: breakdown[categoryIndex]
    }))
  );
}

// =========================================================================
// 📁 src/utils/chartMath.js (支出趨勢圖的純計算)
// =========================================================================
// 這些函數原本內嵌在 ExpenseTrendChart.jsx，抽出來與 React 無關，
// 可直接單元測試（見 chartMath.test.js）。

// 在 (year, month) 基礎上加上 delta 個月，回傳新的 { year, month }
export function addMonths(year, month, delta) {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

export function monthKey(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

// 將最大值無條件進位到「好看」的數字（1 / 2 / 5 / 10 的倍數）
export function niceCeil(v) {
  if (v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const normalized = v / pow;
  let nice;
  if (normalized <= 1) nice = 1;
  else if (normalized <= 2) nice = 2;
  else if (normalized <= 5) nice = 5;
  else nice = 10;
  return nice * pow;
}

// 將金額轉為簡潔標籤（例如 12500 -> 13k）
export function formatCompact(v) {
  if (v >= 10000) return `${(v / 1000).toFixed(0)}k`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(Math.round(v));
}

// 格式化圖表的 tooltip 文字，例如「2026年8月: HK$ 12,500」
export function formatTooltip(year, month, value) {
  return `${year}年${month}月: HK$ ${value.toLocaleString()}`;
}

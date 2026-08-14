import React, { useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';

// =========================================================================
// 📁 src/components/ExpenseTrendChart.jsx
// 支出趨勢折線圖 (7 個月趨勢，支援總支出 / 分類趨勢切換)
// =========================================================================

// 在 (year, month) 基礎上加上 delta 個月，回傳新的 { year, month }
function addMonths(year, month, delta) {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

function monthKey(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

// 將最大值無條件進位到「好看」的數字（1 / 2 / 5 / 10 的倍數）
function niceCeil(v) {
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
function formatCompact(v) {
  if (v >= 10000) return `${(v / 1000).toFixed(0)}k`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(Math.round(v));
}

function ExpenseTrendChart({ transactions, categories, currentYear, currentMonth, onMonthSelect }) {
  const [viewMode, setViewMode] = useState('total'); // 'total' | 'category'
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '');

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;

  // --- 決定要顯示的 7 個月視窗 ---
  // diff = 選取月份 - 今天月份（負數代表過去）
  //  -3 ~ 0：顯示「最近 7 個月」（今天往前 6 個月）
  //  < -3（例如往前 4 個月）：將選取月份置中，顯示前 3 個月 + 後 3 個月
  //  > 0（未來月份）：同樣置中選取月份
  const { windowStart, windowEnd } = useMemo(() => {
    const diff = (currentYear - todayYear) * 12 + (currentMonth - todayMonth);
    if (diff >= -3 && diff <= 0) {
      const end = { year: todayYear, month: todayMonth };
      const start = addMonths(end.year, end.month, -6);
      return { windowStart: start, windowEnd: end };
    }
    const start = addMonths(currentYear, currentMonth, -3);
    const end = addMonths(currentYear, currentMonth, 3);
    return { windowStart: start, windowEnd: end };
  }, [currentYear, currentMonth, todayYear, todayMonth]);

  // 建立 7 個月份的陣列
  const months = useMemo(() => {
    const list = [];
    let cur = { ...windowStart };
    for (let i = 0; i < 7; i++) {
      list.push({ ...cur });
      cur = addMonths(cur.year, cur.month, 1);
    }
    return list;
  }, [windowStart]);

  // 計算每個月的總支出與各分類支出
  const data = useMemo(() => {
    return months.map(m => {
      const key = monthKey(m.year, m.month);
      const monthTx = (Array.isArray(transactions) ? transactions : []).filter(t => {
        if (!t || !t.date) return false;
        return String(t.date).slice(0, 10).startsWith(key);
      });
      const total = monthTx.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
      const byCategory = {};
      monthTx.forEach(t => {
        const cat = t.category || '其他';
        byCategory[cat] = (byCategory[cat] || 0) + (Number(t.amount) || 0);
      });
      return { ...m, key, total, byCategory };
    });
  }, [months, transactions]);

  // 有效分類（若選取的分類被刪除則退回第一個）
  const effectiveCategory = categories.find(c => c.id === selectedCategoryId) || categories[0];
  const lineColor = viewMode === 'total' ? '#6366f1' : (effectiveCategory?.color || '#6366f1');

  // 要繪製的數值
  const values = useMemo(() => {
    if (viewMode === 'total') return data.map(d => d.total);
    const catName = effectiveCategory?.name || '';
    return data.map(d => d.byCategory[catName] || 0);
  }, [data, viewMode, effectiveCategory]);

  // 選取月份在視窗中的索引（-1 代表不在視窗內）
  const highlightIndex = months.findIndex(m => m.year === currentYear && m.month === currentMonth);

  // --- SVG 幾何參數 ---
  const W = 720;
  const H = 280;
  const PAD_L = 60;
  const PAD_R = 20;
  const PAD_T = 20;
  const PAD_B = 40;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const chartBottom = PAD_T + chartH;

  const maxVal = niceCeil(Math.max(...values, 1));
  const yScale = chartH / maxVal;
  const xPos = (i) => PAD_L + (i * (chartW / 6));
  const yPos = (v) => chartBottom - (v * yScale);

  const linePath = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i).toFixed(1)} ${yPos(v).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${xPos(6).toFixed(1)} ${chartBottom} L ${xPos(0).toFixed(1)} ${chartBottom} Z`;

  // 水平格線（0 / 25% / 50% / 75% / 100%）
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    y: chartBottom - (f * chartH),
    value: maxVal * f
  }));

  const rangeLabel = `${windowStart.year}年${windowStart.month}月 - ${windowEnd.year}年${windowEnd.month}月`;

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
      {/* 標題 + 切換按鈕 */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          <span>支出趨勢 (Expense Trend)</span>
        </h2>
        <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('total')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'total'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            總支出
          </button>
          <button
            onClick={() => setViewMode('category')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'category'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            分類趨勢
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-500 mb-3">{rangeLabel}</p>

      {/* 分類選擇（僅分類趨勢模式顯示） */}
      {viewMode === 'category' && (
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                effectiveCategory?.id === cat.id
                  ? 'border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* SVG 折線圖 */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="支出趨勢圖">
        <defs>
          <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* 格線 + Y 軸標籤 */}
        {gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={PAD_L}
              y1={g.y}
              x2={W - PAD_R}
              y2={g.y}
              stroke="#1e293b"
              strokeWidth="1"
              strokeDasharray={i === 0 ? '0' : '4 4'}
            />
            <text x={PAD_L - 8} y={g.y + 4} textAnchor="end" fontSize="11" fill="#64748b">
              {formatCompact(g.value)}
            </text>
          </g>
        ))}

        {/* 面積填色 */}
        <path d={areaPath} fill="url(#trendArea)" />

        {/* 折線 */}
        <path
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 選取月份的垂直標示線 */}
        {highlightIndex >= 0 && (
          <line
            x1={xPos(highlightIndex)}
            y1={PAD_T}
            x2={xPos(highlightIndex)}
            y2={chartBottom}
            stroke={lineColor}
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />
        )}

        {/* 資料點（可點擊切換月份） */}
        {values.map((v, i) => {
          const isHighlight = i === highlightIndex;
          const handleClick = () => onMonthSelect?.(months[i].year, months[i].month);
          return (
            <g key={i} className="cursor-pointer" onClick={handleClick}>
              {/* 較大的隱形點擊區域，方便點擊 */}
              <circle cx={xPos(i)} cy={yPos(v)} r="14" fill="transparent">
                <title>{`${months[i].year}年${months[i].month}月: HK$ ${v.toLocaleString()}`}</title>
              </circle>
              <circle
                cx={xPos(i)}
                cy={yPos(v)}
                r={isHighlight ? 6 : 4}
                fill={isHighlight ? lineColor : '#0d1117'}
                stroke={lineColor}
                strokeWidth={isHighlight ? 3 : 2}
                className="transition-all"
              >
                <title>{`${months[i].year}年${months[i].month}月: HK$ ${v.toLocaleString()}`}</title>
              </circle>
              {isHighlight && (
                <circle
                  cx={xPos(i)}
                  cy={yPos(v)}
                  r="10"
                  fill="none"
                  stroke={lineColor}
                  strokeWidth="1.5"
                  opacity="0.5"
                >
                  <title>{`${months[i].year}年${months[i].month}月: HK$ ${v.toLocaleString()}`}</title>
                </circle>
              )}
            </g>
          );
        })}

        {/* X 軸月份標籤（可點擊切換月份，1 月時額外顯示年份） */}
        {months.map((m, i) => {
          const isHighlight = i === highlightIndex;
          const isJanuary = m.month === 1;
          const handleClick = () => onMonthSelect?.(m.year, m.month);
          return (
            <g key={i} className="cursor-pointer" onClick={handleClick}>
              {isJanuary && (
                <text
                  x={xPos(i)}
                  y={H - 26}
                  textAnchor="middle"
                  fontSize="10"
                  fill={isHighlight ? '#fff' : '#64748b'}
                >
                  {m.year}
                </text>
              )}
              <text
                x={xPos(i)}
                y={H - 12}
                textAnchor="middle"
                fontSize="11"
                fontWeight={isHighlight ? 700 : 400}
                fill={isHighlight ? '#fff' : '#64748b'}
              >
                {m.month}月
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default ExpenseTrendChart;
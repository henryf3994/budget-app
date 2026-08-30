import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useOnClickOutside } from '../hooks/useOnClickOutside.js';
import { getLocalDateString } from '../utils/constants.js';
import { isValidDate } from '../utils/validation.js';

// =========================================================================
// 📁 src/components/MiniCalendar.jsx
// Mini calendar popup for date selection
// =========================================================================

// 一週的星期標題（由星期日開始）
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

// 將 (year, month, day) 格式化為 YYYY-MM-DD
const formatDateStr = (year, month, day) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

// selectedDate 為空字串或格式無效時（例如同步資料的日期不合法），
// 退回「今天所在月份」，避免 new Date(NaN, ...) 顯示「NaN年 NaN月」且日曆空白
const getInitialViewDate = (selectedDate) => {
  const str = String(selectedDate || '').slice(0, 10);
  if (isValidDate(str)) {
    const [y, m] = str.split('-').map(Number);
    return new Date(y, m - 1, 1);
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

function MiniCalendar({ selectedDate, onSelect, onClose }) {
  const [viewDate, setViewDate] = useState(() => getInitialViewDate(selectedDate));

  const calendarRef = useRef(null);
  useOnClickOutside(calendarRef, onClose);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const todayStr = getLocalDateString();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleSelect = (day) => {
    onSelect(formatDateStr(year, month + 1, day));
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div
      ref={calendarRef}
      className="pixel-card absolute z-20 mt-2 bg-surface p-3 w-64"
    >
      {/* Header with month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          aria-label="上一個月"
          className="p-1 rounded-pixel-sm text-muted hover:bg-surface-warm hover:text-ink transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-ink">
          {year}年 {month + 1}月
        </span>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="下一個月"
          className="p-1 rounded-pixel-sm text-muted hover:bg-surface-warm hover:text-ink transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-center text-[10px] text-muted-warm font-semibold">
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          const dateStr = formatDateStr(year, month + 1, day);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => handleSelect(day)}
              className={`w-8 h-8 rounded-pixel-sm text-xs flex items-center justify-center transition ${
                isSelected
                  ? 'bg-primary text-white font-bold shadow-pixel-sm'
                  : isToday
                    ? 'bg-accent text-ink font-semibold border-2 border-ink shadow-pixel-sm'
                    : 'text-ink-soft hover:bg-surface-warm hover:text-ink'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MiniCalendar;
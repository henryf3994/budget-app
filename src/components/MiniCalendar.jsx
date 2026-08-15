<<<<<<< HEAD
import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useOnClickOutside } from '../hooks/useOnClickOutside.js';
import { getLocalDateString } from '../utils/constants.js';

// =========================================================================
// 📁 src/components/MiniCalendar.jsx
// Mini calendar popup for date selection
// =========================================================================
function MiniCalendar({ selectedDate, onSelect, onClose }) {
  const [viewDate, setViewDate] = useState(() => {
    const [y, m] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  const calendarRef = useRef(null);
  useOnClickOutside(calendarRef, onClose);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const todayStr = getLocalDateString();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleSelect = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onSelect(dateStr);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div
      ref={calendarRef}
      className="absolute z-20 mt-2 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl w-64"
    >
      {/* Header with month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-slate-200">
          {year}年 {month + 1}月
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((w, i) => (
          <div key={i} className="text-center text-[10px] text-slate-500 font-medium">
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => handleSelect(day)}
              className={`w-8 h-8 rounded-lg text-xs flex items-center justify-center transition ${
                isSelected
                  ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-900/30'
                  : isToday
                    ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/40'
                    : 'text-slate-300 hover:bg-slate-800'
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

=======
import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useOnClickOutside } from '../hooks/useOnClickOutside.js';
import { getLocalDateString } from '../utils/constants.js';

// =========================================================================
// 📁 src/components/MiniCalendar.jsx
// Mini calendar popup for date selection
// =========================================================================
function MiniCalendar({ selectedDate, onSelect, onClose }) {
  const [viewDate, setViewDate] = useState(() => {
    const [y, m] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  const calendarRef = useRef(null);
  useOnClickOutside(calendarRef, onClose);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const todayStr = getLocalDateString();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleSelect = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onSelect(dateStr);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div
      ref={calendarRef}
      className="absolute z-20 mt-2 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl w-64"
    >
      {/* Header with month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-slate-200">
          {year}年 {month + 1}月
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((w, i) => (
          <div key={i} className="text-center text-[10px] text-slate-500 font-medium">
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => handleSelect(day)}
              className={`w-8 h-8 rounded-lg text-xs flex items-center justify-center transition ${
                isSelected
                  ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-900/30'
                  : isToday
                    ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/40'
                    : 'text-slate-300 hover:bg-slate-800'
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

>>>>>>> 998acd2a1cabc4008ab899458c039b65784d67b6
export default MiniCalendar;
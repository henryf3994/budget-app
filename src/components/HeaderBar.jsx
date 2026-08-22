import React, { useRef, useState } from 'react';
import { MoreVertical, ChevronLeft, ChevronRight, Calendar, RefreshCw, Database, Settings } from 'lucide-react';
import { useOnClickOutside } from '../hooks/useOnClickOutside.js';
import familyAvatar from '../assets/familyavatar.png';

export default function HeaderBar({
  gasUrl,
  loading,
  currentYear,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onRefresh,
  onOpenUrlModal,
  onOpenCategoryModal,
  onSelectDate
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(currentYear);
  const [showMenu, setShowMenu] = useState(false);
  const pickerRef = useRef(null);
  const menuRef = useRef(null);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useOnClickOutside(pickerRef, () => setShowDatePicker(false));
  useOnClickOutside(menuRef, () => setShowMenu(false));

  const handleMonthSelect = (selectedMonth) => {
    if (onSelectDate) {
      onSelectDate(pickerYear, selectedMonth);
    }
    setShowDatePicker(false);
  };

  return (
    <header className="pixel-card border-4 shadow-pixel-lg flex flex-col gap-5 bg-surface-warm p-4 sm:p-5">

      {/* Top Row: Centered brand + actions docked top-right */}
      <div className="relative flex flex-col items-center gap-2 pt-1 sm:pt-2">
        {/* Actions anchored top-right (all in the ⋯ kebab menu) */}
        <div className="absolute top-0 right-0">
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setShowMenu(prev => !prev)}
              aria-label="更多選項"
              title="更多選項"
              className={`p-2.5 rounded-pixel-sm border-2 border-ink shadow-pixel-sm transition focus-visible:outline-offset-2 ${
                gasUrl
                  ? 'bg-surface text-ink-soft hover:text-ink hover:bg-surface-warm'
                  : 'bg-red-50 text-danger animate-pulse'
              }`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 p-1.5 bg-surface border-2 border-ink rounded-pixel-card shadow-pixel z-50 flex flex-col">
                <button
                  onClick={() => { onRefresh(); setShowMenu(false); }}
                  className="text-left px-3 py-2.5 rounded-pixel-sm text-sm font-medium text-ink-soft hover:bg-surface-warm hover:text-ink transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 text-primary-dark ${loading ? 'animate-spin' : ''}`} />
                  {loading ? '重新整理中…' : '重新整理數據'}
                </button>
                <button
                  onClick={() => { onOpenUrlModal(); setShowMenu(false); }}
                  className="text-left px-3 py-2.5 rounded-pixel-sm text-sm font-medium text-ink-soft hover:bg-surface-warm hover:text-ink transition flex items-center gap-2"
                >
                  <Database className="w-4 h-4 text-success" />
                  設定 GAS API URL
                </button>
                <button
                  onClick={() => { onOpenCategoryModal(); setShowMenu(false); }}
                  className="text-left px-3 py-2.5 rounded-pixel-sm text-sm font-medium text-ink-soft hover:bg-surface-warm hover:text-ink transition flex items-center gap-2"
                >
                  <Settings className="w-4 h-4 text-accent-dark" />
                  管理類別與顏色
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Slim centered banner + title */}
        <div className="flex flex-col items-center">
          <svg
            className="w-[272px] sm:w-[326px] h-auto"
            viewBox="0 0 432 147"
            role="img"
            aria-label="家庭圖示"
          >
            <image
              href={familyAvatar}
              width="432"
              height="147"
              preserveAspectRatio="xMidYMid meet"
            />
          </svg>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            家庭記賬App
          </h1>
        </div>
      </div>

      {/* Bottom Row: Date Navigator Centered */}
      <div className="flex justify-center w-full">
        <div className="relative flex items-center bg-surface border-2 border-ink rounded-pixel-card p-1 shadow-pixel">
          <button
            onClick={onPrevMonth}
            aria-label="上一個月"
            className="p-2 hover:bg-surface-warm rounded-pixel-sm text-ink-soft hover:text-ink transition"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          <button
            onClick={() => {
              setPickerYear(currentYear);
              setShowDatePicker(!showDatePicker);
            }}
            className="px-4 sm:px-5 py-1.5 font-bold text-xl sm:text-2xl tracking-wide min-w-[150px] text-center text-ink hover:bg-surface-warm rounded-pixel-sm transition flex items-center justify-center gap-2"
            title="點擊選擇月份"
          >
            <Calendar className="w-5 h-5 text-primary-dark" />
            {currentYear}年{String(currentMonth).padStart(2, '0')}月
          </button>

          <button
            onClick={onNextMonth}
            aria-label="下一個月"
            className="p-2 hover:bg-surface-warm rounded-pixel-sm text-ink-soft hover:text-ink transition"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          {/* Month Picker Popover */}
          {showDatePicker && (
            <div ref={pickerRef} className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-surface border-2 border-ink rounded-pixel-card shadow-pixel z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-ink">
                <button
                  onClick={() => setPickerYear(prev => prev - 1)}
                  className="p-1 hover:bg-surface-warm rounded text-ink-soft hover:text-ink"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-ink text-sm">{pickerYear} 年</span>
                <button
                  onClick={() => setPickerYear(prev => prev + 1)}
                  className="p-1 hover:bg-surface-warm rounded text-ink-soft hover:text-ink"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {months.map(m => (
                  <button
                    key={m}
                    onClick={() => handleMonthSelect(m)}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                      pickerYear === currentYear && m === currentMonth
                        ? 'bg-primary text-white shadow-pixel-sm'
                        : 'bg-surface-warm text-ink-soft hover:bg-accent hover:text-ink'
                    }`}
                  >
                    {m} 月
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}

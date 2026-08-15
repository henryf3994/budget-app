import React, { useRef, useState } from 'react';
import { RefreshCw, MoreVertical, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
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
    <header className="flex flex-col gap-4 border-b border-slate-800 pb-4">
      
      {/* Top Row: Centered brand + actions docked top-right */}
      <div className="relative flex flex-col items-center gap-3 pt-2 sm:pt-3">
        {/* Actions anchored top-right */}
        <div className="absolute top-0 right-0 flex items-center gap-2">
          {/* Refresh — always visible */}
          <button 
            onClick={onRefresh}
            disabled={loading}
            aria-label="重新整理數據"
            title="重新整理數據"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          {/* ⋯ Kebab menu (Database GAS URL + Category settings) */}
          <div ref={menuRef} className="relative">
            <button 
              onClick={() => setShowMenu(prev => !prev)}
              aria-label="更多選項"
              title="更多選項"
              className={`p-2.5 rounded-xl border transition ${
                gasUrl 
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
              }`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 p-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 flex flex-col">
                <button 
                  onClick={() => { onOpenUrlModal(); setShowMenu(false); }}
                  className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 transition"
                >
                  設定 GAS API URL
                </button>
                <button 
                  onClick={() => { onOpenCategoryModal(); setShowMenu(false); }}
                  className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 transition"
                >
                  管理類別與顏色
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Slim centered banner + title */}
        <div className="flex flex-col items-center">
          <svg
            className="w-40 sm:w-48 h-auto"
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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            家庭記賬App
          </h1>
        </div>
      </div>

      {/* Bottom Row: Date Navigator Centered */}
      <div className="flex justify-center w-full">
        <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-inner">
          <button 
            onClick={onPrevMonth} 
            aria-label="上一個月"
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          <button
            onClick={() => {
              setPickerYear(currentYear);
              setShowDatePicker(!showDatePicker);
            }}
            className="px-5 py-1 font-bold text-[1.8rem] tracking-wider min-w-[150px] text-center text-slate-100 hover:bg-slate-800/80 rounded-lg transition flex items-center justify-center gap-2"
            title="點擊選擇月份"
          >
            <Calendar className="w-5 h-5 text-slate-400" />
            {currentYear}年{String(currentMonth).padStart(2, '0')}月
          </button>

          <button 
            onClick={onNextMonth} 
            aria-label="下一個月"
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          {/* Month Picker Popover */}
          {showDatePicker && (
            <div ref={pickerRef} className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <button 
                  onClick={() => setPickerYear(prev => prev - 1)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-white text-sm">{pickerYear} 年</span>
                <button 
                  onClick={() => setPickerYear(prev => prev + 1)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
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
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white'
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

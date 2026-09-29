import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useOnClickOutside } from '../hooks/useOnClickOutside.js';
import fmhAvatar from '../assets/fmh.png';
import yskAvatar from '../assets/ysk.png';
import rileyAvatar from '../assets/riley.png';
import buluAvatar from '../assets/bulu.png';

// =========================================================================
// 📁 src/components/HeaderBar.jsx
// =========================================================================

// 月份選單用的 1–12 常數（避免每次 render 重建陣列）
const MONTH_LABELS = Array.from({ length: 12 }, (_, i) => i + 1);

// 上／下月導航按鈕的共用樣式
const NAV_BUTTON_CLASS = 'p-2 hover:bg-surface-warm rounded-pixel-sm text-ink-soft hover:text-ink transition';
const MONTH_PICKER_BUTTON_CLASS = 'p-1 hover:bg-surface-warm rounded text-ink-soft hover:text-ink';

export default function HeaderBar({ currentYear, currentMonth, onPrevMonth, onNextMonth, onSelectDate }) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(currentYear);
  const pickerRef = useRef(null);

  useOnClickOutside(pickerRef, () => setShowDatePicker(false));

  const handleMonthSelect = selectedMonth => {
    if (onSelectDate) {
      onSelectDate(pickerYear, selectedMonth);
    }
    setShowDatePicker(false);
  };

  return (
    <header className="pixel-card border-4 shadow-pixel-lg flex flex-col gap-5 bg-surface-warm p-4 sm:p-5">
      {/* Top Row: Centered brand + actions docked top-right */}
      <div className="flex flex-col items-center gap-2 pt-1 sm:pt-2">
        {/* Slim centered banner + title */}
        <div className="flex flex-col items-center">
          <div
            className="flex h-[92px] w-[300px] items-start justify-center gap-2.5 sm:h-[108px] sm:w-[360px] sm:gap-3"
            role="img"
            aria-label="家庭成員圖示"
          >
            <img className="h-full min-w-0 flex-1 object-contain" src={fmhAvatar} alt="" />
            <img className="h-full min-w-0 flex-1 object-contain" src={yskAvatar} alt="" />
            <img className="h-full min-w-0 flex-1 object-contain" src={rileyAvatar} alt="" />
            <img className="h-full min-w-0 flex-1 object-contain" src={buluAvatar} alt="" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">家庭記賬App</h1>
        </div>
      </div>

      {/* Bottom Row: Date Navigator Centered */}
      <div className="flex justify-center w-full">
        <div className="relative flex items-center bg-surface border-2 border-ink rounded-pixel-card p-1 shadow-pixel">
          <button type="button" onClick={onPrevMonth} aria-label="上一個月" className={NAV_BUTTON_CLASS}>
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          {/* 將切換按鈕與彈出曆包進同一個 ref 容器。原本 ref 只包住彈出曆，
              點擊切換按鈕時會先被 onClickOutside 關閉、又被 toggle 重新開啟，
              導致彈出曆永遠無法用按鈕關閉 */}
          <div ref={pickerRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setPickerYear(currentYear);
                setShowDatePicker(prev => !prev);
              }}
              className="px-4 sm:px-5 py-1.5 font-bold text-xl sm:text-2xl tracking-wide min-w-[150px] text-center text-ink hover:bg-surface-warm rounded-pixel-sm transition flex items-center justify-center gap-2"
              title="點擊選擇月份"
            >
              <Calendar className="w-5 h-5 text-primary-dark" />
              {currentYear}年{String(currentMonth).padStart(2, '0')}月
            </button>

            {/* Month Picker Popover */}
            {showDatePicker && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-surface border-2 border-ink rounded-pixel-card shadow-pixel z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-ink">
                  <button
                    type="button"
                    onClick={() => setPickerYear(prev => prev - 1)}
                    className={MONTH_PICKER_BUTTON_CLASS}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-ink text-sm">{pickerYear} 年</span>
                  <button
                    type="button"
                    onClick={() => setPickerYear(prev => prev + 1)}
                    className={MONTH_PICKER_BUTTON_CLASS}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {MONTH_LABELS.map(m => (
                    <button
                      type="button"
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

          <button type="button" onClick={onNextMonth} aria-label="下一個月" className={NAV_BUTTON_CLASS}>
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>
      </div>
    </header>
  );
}

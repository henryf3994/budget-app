import React, { useState, useMemo, useEffect } from 'react';

// 預設可選的顏色調色盤 (用於動態建立/修改新類別)
const COLOR_PALETTE = [
{ id: 'indigo', name: '靛藍', color: 'bg-indigo-500', textColor: 'text-indigo-400', badgeBg: 'bg-indigo-500/10 border-indigo-500/30', barColor: '#6366f1' },
{ id: 'purple', name: '紫色', color: 'bg-purple-500', textColor: 'text-purple-400', badgeBg: 'bg-purple-500/10 border-purple-500/30', barColor: '#a855f7' },
{ id: 'rose', name: '玫瑰紅', color: 'bg-rose-500', textColor: 'text-rose-400', badgeBg: 'bg-rose-500/10 border-rose-500/30', barColor: '#f43f5e' },
{ id: 'amber', name: '琥珀黃', color: 'bg-amber-500', textColor: 'text-amber-400', badgeBg: 'bg-amber-500/10 border-amber-500/30', barColor: '#f59e0b' },
{ id: 'emerald', name: '翡翠綠', color: 'bg-emerald-500', textColor: 'text-emerald-400', badgeBg: 'bg-emerald-500/10 border-emerald-500/30', barColor: '#10b981' },
{ id: 'cyan', name: '湖水藍', color: 'bg-cyan-500', textColor: 'text-cyan-400', badgeBg: 'bg-cyan-500/10 border-cyan-500/30', barColor: '#06b6d4' },
{ id: 'slate', name: '質感灰', color: 'bg-slate-500', textColor: 'text-slate-400', badgeBg: 'bg-slate-500/10 border-slate-500/30', barColor: '#64748b' },
{ id: 'fuchsia', name: '桃粉紅', color: 'bg-fuchsia-500', textColor: 'text-fuchsia-400', badgeBg: 'bg-fuchsia-500/10 border-fuchsia-500/30', barColor: '#d946ef' }
];

// 初始類別清單
const INITIAL_CATEGORIES = [
{ id: 'housing', name: '住屋', color: 'bg-indigo-500', textColor: 'text-indigo-400', badgeBg: 'bg-indigo-500/10 border-indigo-500/30', barColor: '#6366f1' },
{ id: 'recurring', name: '訂閱保險', color: 'bg-purple-500', textColor: 'text-purple-400', badgeBg: 'bg-purple-500/10 border-purple-500/30', barColor: '#a855f7' },
{ id: 'shopping', name: '購物娛樂', color: 'bg-rose-500', textColor: 'text-rose-400', badgeBg: 'bg-rose-500/10 border-rose-500/30', barColor: '#f43f5e' },
{ id: 'helper', name: '工人洗費', color: 'bg-amber-500', textColor: 'text-amber-400', badgeBg: 'bg-amber-500/10 border-amber-500/30', barColor: '#f59e0b' },
{ id: 'riley', name: 'Riley 洗費', color: 'bg-emerald-500', textColor: 'text-emerald-400', badgeBg: 'bg-emerald-500/10 border-emerald-500/30', barColor: '#10b981' },
{ id: 'other', name: '其他', color: 'bg-slate-500', textColor: 'text-slate-400', badgeBg: 'bg-slate-500/10 border-slate-500/30', barColor: '#64748b' },
];

// 初始各類別下的快速推薦預設清單
const INITIAL_CATEGORY_PRESETS: Record<string, string[]> = {
housing: ['水費', '電費', '煤氣費', '房屋租金', '管理費', '差餉地租', '寬頻網絡'],
recurring: ['醫療人壽保險', 'Netflix 4K 訂閱', 'Spotify / Apple Music', 'iCloud 儲存', '健身房會籍', 'YouTube Premium'],
helper: ['工人月薪及津貼', '買菜及買洗滌用品買單', '工人強積金 (MPF)', '勞工保險', '返鄉機票補貼'],
riley: ['Riley 興趣班學費', 'Riley 買衣服與玩具', '補習/學校費用', '奶粉及紙尿片'],
shopping: ['週末家庭商場購物', '超市日用購物', '餐廳飲食聚餐', '網購消費', '電子產品/家電'],
other: ['雜項支出', '臨時費用', '禮盒/紅包', '車庫維修費', '其他開支']
};

const PAYERS = ['YSK', 'FMH'];
const PAYMENT_METHODS = ['現金', '信用卡', '轉賬', 'Alipay'];

const FREQUENCIES = [
{ id: 'monthly', name: '每月', label: '每月扣款', divider: 1 },
{ id: 'quarterly', name: '每季', label: '每季 (3個月)', divider: 3 },
{ id: 'yearly', name: '每年', label: '每年 (12個月)', divider: 12 },
];

const INITIAL_RECURRING_RULES = [
{ id: 101, amount: 15000, category: 'housing', title: '房屋租金', payer: 'YSK', paymentMethod: '轉賬', note: '每月1號自動轉帳', frequency: 'monthly', dayOfMonth: 1 },
{ id: 102, amount: 4730, category: 'helper', title: '工人月薪及津貼', payer: 'YSK', paymentMethod: '轉賬', note: '含基本工薪及膳食費', frequency: 'monthly', dayOfMonth: 1 },
{ id: 103, amount: 2200, category: 'recurring', title: '醫療人壽保險', payer: 'FMH', paymentMethod: '信用卡', note: '保單號 #HK-88392', frequency: 'monthly', dayOfMonth: 5 },
{ id: 104, amount: 1500, category: 'riley', title: 'Riley 興趣班學費', payer: 'FMH', paymentMethod: 'Alipay', note: '繪畫課與游泳課', frequency: 'monthly', dayOfMonth: 10 },
{ id: 105, amount: 98, category: 'recurring', title: 'Netflix 4K 訂閱', payer: 'YSK', paymentMethod: '信用卡', note: '家庭共享方案', frequency: 'monthly', dayOfMonth: 15 },
];

const INITIAL_TRANSACTIONS = [
{ id: 1, amount: 15000, category: 'housing', date: '2026-07-01', title: '房屋租金', payer: 'YSK', paymentMethod: '轉賬', note: '7月份租金轉帳', isRecurring: true, frequency: 'monthly' },
{ id: 2, amount: 4730, category: 'helper', date: '2026-07-01', title: '工人月薪及津貼', payer: 'YSK', paymentMethod: '轉賬', note: '自動轉帳發薪', isRecurring: true, frequency: 'monthly' },
{ id: 3, amount: 2200, category: 'recurring', date: '2026-07-05', title: '醫療人壽保險', payer: 'FMH', paymentMethod: '信用卡', note: '銀行扣款成功', isRecurring: true, frequency: 'monthly' },
{ id: 4, amount: 1500, category: 'riley', date: '2026-07-10', title: 'Riley 興趣班學費', payer: 'FMH', paymentMethod: 'Alipay', note: '夏季繪畫課程', isRecurring: true, frequency: 'monthly' },
{ id: 5, amount: 680, category: 'riley', date: '2026-07-18', title: 'Riley 買衣服與玩具', payer: 'FMH', paymentMethod: '信用卡', note: '百貨公司購買夏季服飾', isRecurring: false, frequency: 'monthly' },
{ id: 6, amount: 450, category: 'shopping', date: '2026-07-22', title: '週末家庭商場購物', payer: 'YSK', paymentMethod: 'Alipay', note: '超市食材採購', isRecurring: false, frequency: 'monthly' },
{ id: 7, amount: 350, category: 'helper', date: '2026-07-25', title: '買菜及買洗滌用品買單', payer: 'YSK', paymentMethod: '現金', note: '街市買菜單據實報實銷', isRecurring: false, frequency: 'monthly' },
{ id: 8, amount: 500, category: 'other', date: '2026-07-28', title: '朋友結婚紅包禮金', payer: 'YSK', paymentMethod: '現金', note: '婚宴賀禮', isRecurring: false, frequency: 'monthly' },
];

const PlusIcon = () => (
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
</svg>
);

const RepeatIcon = () => (
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
</svg>
);

const SettingsIcon = () => (
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
</svg>
);

const TrashIcon = () => (
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
</svg>
);

const EditIcon = () => (
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
</svg>
);

const DownloadIcon = () => (
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
</svg>
);

const UploadIcon = () => (
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
</svg>
);

const SearchIcon = () => (
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
</svg>
);

const CalendarIcon = () => (
<svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
</svg>
);

const LargeChevronLeftIcon = () => (
<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
</svg>
);

const LargeChevronRightIcon = () => (
<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
</svg>
);

const CloudIcon = () => (
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 001-9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
</svg>
);

function MiniCalendarPicker({ value, onChange }: { value: string; onChange: (d: string) => void }) {
const [isOpen, setIsOpen] = useState(false);

const selectedDate = useMemo(() => {
if (!value) return new Date();
const [y, m, d] = value.split('-').map(Number);
return new Date(y, m - 1, d);
}, [value]);

const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

const handleToggle = () => {
if (!isOpen) {
setViewYear(selectedDate.getFullYear());
setViewMonth(selectedDate.getMonth());
}
setIsOpen(!isOpen);
};

const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

const handleSelectDay = (day: number) => {
const m = String(viewMonth + 1).padStart(2, '0');
const d = String(day).padStart(2, '0');
const formatted = `${viewYear}-${m}-${d}`;
onChange(formatted);
setIsOpen(false);
};

const handleQuickSelect = (offsetDays: number) => {
const d = new Date();
d.setDate(d.getDate() + offsetDays);
const yyyy = d.getFullYear();
const mm = String(d.getMonth() + 1).padStart(2, '0');
const dd = String(d.getDate()).padStart(2, '0');
const formatted = `${yyyy}-${mm}-${dd}`;
onChange(formatted);
setViewYear(yyyy);
setViewMonth(d.getMonth());
setIsOpen(false);
};

const prevMonth = () => {
if (viewMonth === 0) {
setViewMonth(11);
setViewYear(viewYear - 1);
} else {
setViewMonth(viewMonth - 1);
}
};

const nextMonth = () => {
if (viewMonth === 11) {
setViewMonth(0);
setViewYear(viewYear + 1);
} else {
setViewMonth(viewMonth + 1);
}
};

const yearStr = selectedDate.getFullYear();
const monthStr = String(selectedDate.getMonth() + 1).padStart(2, '0');
const dayStr = String(selectedDate.getDate()).padStart(2, '0');
const displayString = `${yearStr}年${monthStr}月${dayStr}日`;

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

return (
<div className="relative">
<button
type="button"
onClick={handleToggle}
className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 flex items-center justify-between gap-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all cursor-pointer font-medium"
>
<span>{displayString}</span>
<CalendarIcon />
</button>

{isOpen && (
<div className="absolute top-full left-0 mt-2 z-50 w-64 p-3 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl backdrop-blur-md space-y-2 animate-in fade-in zoom-in-95 duration-150">
<div className="flex items-center justify-between gap-1.5 pb-2 border-b border-slate-800">
<button
type="button"
onClick={() => handleQuickSelect(0)}
className="px-2 py-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors flex-1 cursor-pointer"
>
今天
</button>
<button
type="button"
onClick={() => handleQuickSelect(-1)}
className="px-2 py-1 text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors flex-1 cursor-pointer"
>
昨天
</button>
</div>

<div className="flex items-center justify-between text-xs font-bold text-white px-1 py-1">
<button
type="button"
onClick={prevMonth}
className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
>
◀
</button>
<span>{viewYear}年 {viewMonth + 1}月</span>
<button
type="button"
onClick={nextMonth}
className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
>
▶
</button>
</div>

<div className="grid grid-cols-7 text-center text-[10px] font-semibold text-slate-500">
{weekDays.map(w => (
<div key={w} className="py-1">{w}</div>
))}
</div>

<div className="grid grid-cols-7 gap-1 text-center text-xs">
{Array.from({ length: firstDayOfWeek }).map((_, i) => (
<div key={`empty-${i}`} />
))}
{Array.from({ length: daysInMonth }).map((_, i) => {
const dayNum = i + 1;
const isSelected =
selectedDate.getFullYear() === viewYear &&
selectedDate.getMonth() === viewMonth &&
selectedDate.getDate() === dayNum;

return (
<button
type="button"
key={dayNum}
onClick={() => handleSelectDay(dayNum)}
className={`h-7 w-7 flex items-center justify-center rounded-lg text-xs font-medium transition-all cursor-pointer ${
isSelected
? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
: 'text-slate-200 hover:bg-slate-800 hover:text-white'
}`}
>
{dayNum}
</button>
);
})}
</div>
</div>
)}
</div>
);
}

export default function App() {
// Cloud Sync State
const [gasUrl, setGasUrl] = useState(() => localStorage.getItem('GAS_API_URL') || '');
const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
const [isSyncing, setIsSyncing] = useState(false);

const [categories, setCategories] = useState(INITIAL_CATEGORIES);
const [categoryPresets, setCategoryPresets] = useState<Record<string, string[]>>(INITIAL_CATEGORY_PRESETS);
const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
const [recurringRules, setRecurringRules] = useState(INITIAL_RECURRING_RULES);
const [selectedMonth, setSelectedMonth] = useState('2026-07');
const [searchQuery, setSearchQuery] = useState('');
const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

// Modals state
const [isModalOpen, setIsModalOpen] = useState(false);
const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
const [isManageCategoriesModalOpen, setIsManageCategoriesModalOpen] = useState(false);
const [recurringFilter, setRecurringFilter] = useState('all');

const [editingTxId, setEditingTxId] = useState<number | null>(null);
const [editingRuleId, setEditingRuleId] = useState<number | null>(null);

// Dynamic Category Management Form State
const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
const [selectedCatForPresets, setSelectedCatForPresets] = useState<string>('housing');
const [newCategoryName, setNewCategoryName] = useState('');
const [selectedColorIndex, setSelectedColorIndex] = useState(0);
const [newPresetItemName, setNewPresetItemName] = useState('');

// New/edit transaction form state
const [formData, setFormData] = useState({
amount: '',
category: 'housing',
date: new Date().toISOString().split('T')[0],
title: '',
payer: 'YSK',
paymentMethod: '信用卡',
note: '',
isRecurring: false,
frequency: 'monthly'
});

// Recurring template form state
const [newRecurringForm, setNewRecurringForm] = useState({
amount: '',
category: 'recurring',
title: '',
payer: 'YSK',
paymentMethod: '信用卡',
note: '',
frequency: 'monthly',
dayOfMonth: '1'
});

// 讀取雲端資料
const fetchCloudData = async () => {
if (!gasUrl) return;
setIsSyncing(true);
try {
const response = await fetch(`${gasUrl}?action=getExpenses`);
const json = await response.json();
if (json.status === 'success' && Array.isArray(json.data)) {
setTransactions(json.data.reverse());
}
} catch (err) {
console.error('抓取雲端資料失敗:', err);
} finally {
setIsSyncing(false);
}
};

useEffect(() => {
fetchCloudData();
}, [gasUrl]);

const handleSaveGasUrl = () => {
localStorage.setItem('GAS_API_URL', gasUrl.trim());
setIsCloudModalOpen(false);
fetchCloudData();
};

// Month Navigation Handlers
const handlePrevMonth = () => {
const [year, month] = selectedMonth.split('-').map(Number);
const date = new Date(year, month - 2, 1);
const yyyy = date.getFullYear();
const mm = String(date.getMonth() + 1).padStart(2, '0');
setSelectedMonth(`${yyyy}-${mm}`);
};

const handleNextMonth = () => {
const [year, month] = selectedMonth.split('-').map(Number);
const date = new Date(year, month, 1);
const yyyy = date.getFullYear();
const mm = String(date.getMonth() + 1).padStart(2, '0');
setSelectedMonth(`${yyyy}-${mm}`);
};

// Import CSV Function
const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
const file = event.target.files?.[0];
if (!file) return;

const reader = new FileReader();
reader.onload = (e) => {
const text = e.target?.result as string;
if (!text) return;

const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
if (lines.length <= 1) {
alert('CSV 檔案為空或格式不正確');
return;
}

const newTransactions: any[] = [];
const now = Date.now();

const catNameMap: Record<string, string> = {};
categories.forEach(c => { catNameMap[c.name] = c.id; });

for (let i = 1; i < lines.length; i++) {
const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());

if (values.length >= 7) {
const [date, catName, title, payer, paymentMethod, note, amountStr, freqName] = values;

const amount = parseFloat(amountStr);
if (isNaN(amount)) continue;

let isRecurring = false;
let frequency = 'monthly';

if (freqName && freqName !== '單次') {
isRecurring = true;
const freqObj = FREQUENCIES.find(f => f.name === freqName);
if (freqObj) frequency = freqObj.id;
}

newTransactions.push({
id: now + i,
date: date || new Date().toISOString().split('T')[0],
category: catNameMap[catName] || 'other',
title: title || '',
payer: payer || 'YSK',
paymentMethod: paymentMethod || '信用卡',
note: note || '',
amount: amount,
isRecurring,
frequency
});
}
}

if (newTransactions.length > 0) {
setTransactions(prev => [...newTransactions, ...prev]);
alert(`匯入成功！已載入 ${newTransactions.length} 筆紀錄。`);
} else {
alert('找不到有效的數據列，請確保 CSV 格式與系統匯出的格式一致。');
}

event.target.value = '';
};
reader.readAsText(file);
};

// Dynamic Category & Preset Management Logic
const handleSaveCategory = (e: React.FormEvent) => {
e.preventDefault();
if (!newCategoryName.trim()) return;

const palette = COLOR_PALETTE[selectedColorIndex];

if (editingCategoryId) {
setCategories(categories.map(c => c.id === editingCategoryId ? {
...c,
name: newCategoryName.trim(),
color: palette.color,
textColor: palette.textColor,
badgeBg: palette.badgeBg,
barColor: palette.barColor
} : c));
setEditingCategoryId(null);
} else {
const id = `cat_${Date.now()}`;
const newCatObj = {
id,
name: newCategoryName.trim(),
color: palette.color,
textColor: palette.textColor,
badgeBg: palette.badgeBg,
barColor: palette.barColor
};
setCategories([...categories, newCatObj]);
setCategoryPresets(prev => ({ ...prev, [id]: ['通用開支', '日用雜項'] }));
}

setNewCategoryName('');
setSelectedColorIndex(0);
};

const handleEditCategory = (cat: any) => {
setEditingCategoryId(cat.id);
setNewCategoryName(cat.name);
const cIndex = COLOR_PALETTE.findIndex(p => p.color === cat.color);
setSelectedColorIndex(cIndex !== -1 ? cIndex : 0);
};

const handleCancelEditCategory = () => {
setEditingCategoryId(null);
setNewCategoryName('');
setSelectedColorIndex(0);
};

const handleDeleteCategory = (catId: string) => {
const inUseInTx = transactions.some(t => t.category === catId);
const inUseInRule = recurringRules.some(r => r.category === catId);

if (inUseInTx || inUseInRule) {
alert('無法刪除：目前已有記賬或恆常項目套用此類別。請先變更相關紀錄的類別後再試。');
return;
}

if (categories.length <= 1) {
alert('請至少保留一個支出類別！');
return;
}

setCategories(categories.filter(c => c.id !== catId));
setCategoryPresets(prev => {
const copy = { ...prev };
delete copy[catId];
return copy;
});

if (selectedCatForPresets === catId) {
setSelectedCatForPresets(categories.find(c => c.id !== catId)?.id || '');
}
};

const handleAddPresetItem = (e: React.FormEvent) => {
e.preventDefault();
if (!newPresetItemName.trim() || !selectedCatForPresets) return;

const currentPresets = categoryPresets[selectedCatForPresets] || [];
if (currentPresets.includes(newPresetItemName.trim())) return;

setCategoryPresets({
...categoryPresets,
[selectedCatForPresets]: [...currentPresets, newPresetItemName.trim()]
});
setNewPresetItemName('');
};

const handleDeletePresetItem = (catId: string, itemToDelete: string) => {
setCategoryPresets({
...categoryPresets,
[catId]: (categoryPresets[catId] || []).filter(item => item !== itemToDelete)
});
};

const handleCategoryClick = (catId: string) => {
if (selectedCategoryFilter === catId) {
setSelectedCategoryFilter('all');
} else {
setSelectedCategoryFilter(catId);
const el = document.getElementById('transaction-list-section');
if (el) {
el.scrollIntoView({ behavior: 'smooth' });
}
}
};

const monthlyTransactions = useMemo(() => {
return transactions.filter(t => t.date.startsWith(selectedMonth));
}, [transactions, selectedMonth]);

const totalMonthlyAmount = useMemo(() => {
return monthlyTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
}, [monthlyTransactions]);

const categoryBreakdown = useMemo(() => {
const totals: Record<string, number> = {};
categories.forEach(c => { totals[c.id] = 0; });

monthlyTransactions.forEach(t => {
if (totals[t.category] !== undefined) {
totals[t.category] += Number(t.amount || 0);
}
});

return categories.map(cat => {
const amount = totals[cat.id] || 0;
const percentage = totalMonthlyAmount > 0 ? ((amount / totalMonthlyAmount) * 100).toFixed(1) : '0.0';
return {
...cat,
amount,
percentage: parseFloat(percentage)
};
}).sort((a, b) => b.amount - a.amount);
}, [categories, monthlyTransactions, totalMonthlyAmount]);

const filteredTransactions = useMemo(() => {
return monthlyTransactions.filter(t => {
const matchesSearch = (t.title && t.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
(t.note && t.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
(t.payer && t.payer.toLowerCase().includes(searchQuery.toLowerCase())) ||
(t.paymentMethod && t.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())) ||
t.amount.toString().includes(searchQuery);
const matchesCategory = selectedCategoryFilter === 'all' || t.category === selectedCategoryFilter;
return matchesSearch && matchesCategory;
});
}, [monthlyTransactions, searchQuery, selectedCategoryFilter]);

const filteredRecurringRules = useMemo(() => {
if (recurringFilter === 'all') return recurringRules;
return recurringRules.filter(r => r.frequency === recurringFilter);
}, [recurringRules, recurringFilter]);

const totalMonthlyRecurringEstimate = useMemo(() => {
return recurringRules.reduce((acc, rule) => {
const freqObj = FREQUENCIES.find(f => f.id === rule.frequency);
const monthlyAmount = rule.amount / (freqObj?.divider || 1);
return acc + monthlyAmount;
}, 0);
}, [recurringRules]);

const handleOpenCreateTransaction = () => {
setEditingTxId(null);
setFormData({
amount: '',
category: categories[0]?.id || 'housing',
date: new Date().toISOString().split('T')[0],
title: '',
payer: 'YSK',
paymentMethod: '信用卡',
note: '',
isRecurring: false,
frequency: 'monthly'
});
setIsModalOpen(true);
};

const handleOpenEditTransaction = (tx: any) => {
setEditingTxId(tx.id);
setFormData({
amount: tx.amount.toString(),
category: tx.category,
date: tx.date,
title: tx.title || '',
payer: tx.payer || 'YSK',
paymentMethod: tx.paymentMethod || '信用卡',
note: tx.note || '',
isRecurring: tx.isRecurring || false,
frequency: tx.frequency || 'monthly'
});
setIsModalOpen(true);
};

const handleAddTransaction = async (e: React.FormEvent) => {
e.preventDefault();
if (!formData.amount || Number(formData.amount) <= 0) return;

const defaultTitle = categories.find(c => c.id === formData.category)?.name;
const txId = editingTxId || Date.now();

const newTx = {
id: txId,
amount: Number(formData.amount),
category: formData.category,
date: formData.date,
title: formData.title || defaultTitle,
payer: formData.payer,
paymentMethod: formData.paymentMethod,
note: formData.note,
isRecurring: formData.isRecurring,
frequency: formData.frequency
};

if (editingTxId) {
setTransactions(transactions.map(t => t.id === editingTxId ? newTx : t));
} else {
setTransactions([newTx, ...transactions]);
}

setIsModalOpen(false);
setEditingTxId(null);

// 寫入 Google Sheet 雲端
if (gasUrl) {
setIsSyncing(true);
try {
await fetch(gasUrl, {
method: 'POST',
mode: 'no-cors',
headers: { 'Content-Type': 'text/plain;charset=utf-8' },
body: JSON.stringify({ action: 'addExpense', data: newTx })
});
} catch (err) {
console.error('寫入雲端失敗:', err);
} finally {
setIsSyncing(false);
}
}
};

const handleOpenEditRecurringRule = (rule: any) => {
setEditingRuleId(rule.id);
setNewRecurringForm({
amount: rule.amount.toString(),
category: rule.category,
title: rule.title || '',
payer: rule.payer || 'YSK',
paymentMethod: rule.paymentMethod || '信用卡',
note: rule.note || '',
frequency: rule.frequency,
dayOfMonth: rule.dayOfMonth ? rule.dayOfMonth.toString() : '1'
});
};

const handleCancelEditRecurringRule = () => {
setEditingRuleId(null);
setNewRecurringForm({
amount: '',
category: categories[0]?.id || 'recurring',
title: '',
payer: 'YSK',
paymentMethod: '信用卡',
note: '',
frequency: 'monthly',
dayOfMonth: '1'
});
};

const handleAddRecurringRule = (e: React.FormEvent) => {
e.preventDefault();
if (!newRecurringForm.amount || Number(newRecurringForm.amount) <= 0) return;

const defaultTitle = categories.find(c => c.id === newRecurringForm.category)?.name;

if (editingRuleId) {
setRecurringRules(recurringRules.map(r => r.id === editingRuleId ? {
...r,
amount: Number(newRecurringForm.amount),
category: newRecurringForm.category,
title: newRecurringForm.title || defaultTitle,
payer: newRecurringForm.payer,
paymentMethod: newRecurringForm.paymentMethod,
note: newRecurringForm.note,
frequency: newRecurringForm.frequency,
dayOfMonth: Number(newRecurringForm.dayOfMonth) || 1
} : r));
setEditingRuleId(null);
} else {
const newRule = {
id: Date.now(),
amount: Number(newRecurringForm.amount),
category: newRecurringForm.category,
title: newRecurringForm.title || defaultTitle,
payer: newRecurringForm.payer,
paymentMethod: newRecurringForm.paymentMethod,
note: newRecurringForm.note,
frequency: newRecurringForm.frequency,
dayOfMonth: Number(newRecurringForm.dayOfMonth) || 1
};
setRecurringRules([...recurringRules, newRule]);
}

setNewRecurringForm({
amount: '',
category: categories[0]?.id || 'recurring',
title: '',
payer: 'YSK',
paymentMethod: '信用卡',
note: '',
frequency: 'monthly',
dayOfMonth: '1'
});
};

const handleDeleteTransaction = (id: number) => {
setTransactions(transactions.filter(t => t.id !== id));
};

const handleDeleteRecurringRule = (id: number) => {
setRecurringRules(recurringRules.filter(r => r.id !== id));
};

const exportCSV = () => {
const headers = ["日期", "類別", "項目名稱", "付款人", "付款方式", "備註說明", "金額(HK$)", "恆常類型"];
const rows = monthlyTransactions.map(t => {
const catName = categories.find(c => c.id === t.category)?.name || t.category;
const freqName = t.isRecurring ? (FREQUENCIES.find(f => f.id === t.frequency)?.name || '恆常') : '單次';
const escapedTitle = `"${(t.title || '').replace(/"/g, '""')}"`;
const escapedNote = `"${(t.note || '').replace(/"/g, '""')}"`;

return [t.date, catName, escapedTitle, t.payer || 'YSK', t.paymentMethod || '信用卡', escapedNote, t.amount, freqName];
});

const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
+ [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

const encodedUri = encodeURI(csvContent);
const link = document.createElement("a");
link.setAttribute("href", encodedUri);
link.setAttribute("download", `Expense_Report_${selectedMonth}.csv`);
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
};

return (
<div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased p-4 md:p-8">
<div className="max-w-6xl mx-auto space-y-6">

{/* Top Header Navigation */}
<header className="relative bg-slate-900/60 px-4 py-5 md:px-6 md:py-6 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-xl flex flex-col gap-4">
<div className="flex items-center justify-between w-full">

{/* 左側功能區：匯入/匯出按鈕 ＋ App 名稱 */}
<div className="flex items-center gap-3">
<div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800">
{/* 雲端同步設定按鈕 */}
<button
onClick={() => setIsCloudModalOpen(true)}
className={`p-2 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center shrink-0 ${
gasUrl ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700/80'
}`}
title="雲端同步設定"
>
<CloudIcon />
</button>

{/* 匯入 CSV 按鈕 */}
<div>
<input type="file" accept=".csv" className="hidden" id="csv-upload" onChange={handleImportCSV} />
<label
htmlFor="csv-upload"
className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700/80 rounded-xl transition-all active:scale-95 cursor-pointer shadow-md flex items-center justify-center shrink-0"
title="匯入 CSV 紀錄"
>
<UploadIcon />
</label>
</div>

{/* 匯出 CSV 按鈕 */}
<button
onClick={exportCSV}
className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700/80 rounded-xl transition-all active:scale-95 cursor-pointer shadow-md flex items-center justify-center shrink-0"
title="匯出本月 CSV 報表"
>
<DownloadIcon />
</button>
</div>

<div>
<h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
<span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">私人記賬本</span>
{isSyncing && <span className="text-[10px] text-emerald-400 font-medium animate-pulse">Syncing...</span>}
{!isSyncing && gasUrl && <span className="text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium hidden sm:inline">Cloud DB Sync</span>}
</h1>
<p className="text-[11px] md:text-xs text-slate-400 mt-0.5 hidden xs:block">獨立個人財務追蹤 • 每月開支統計</p>
</div>
</div>

{/* 右側：管理類別按鈕 */}
<button
onClick={() => setIsManageCategoriesModalOpen(true)}
className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 text-xs px-3 py-2 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm"
title="自訂類別與預設項目"
>
<SettingsIcon />
<span className="hidden sm:inline font-medium">管理類別</span>
</button>
</div>

<div className="flex items-center justify-between w-full pt-1">
<button
onClick={handlePrevMonth}
className="w-10 h-10 md:w-11 md:h-11 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-700/80 rounded-2xl transition-all active:scale-90 cursor-pointer shadow-lg flex items-center justify-center shrink-0"
title="上一個月"
>
<LargeChevronLeftIcon />
</button>

<div className="relative mx-2">
<input
type="month"
value={selectedMonth}
onChange={(e) => setSelectedMonth(e.target.value)}
className="bg-slate-950 border border-slate-700/80 text-slate-100 text-base md:text-lg font-black rounded-xl px-4 py-2 text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer shadow-inner tracking-wider"
/>
</div>

<button
onClick={handleNextMonth}
className="w-10 h-10 md:w-11 md:h-11 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-700/80 rounded-2xl transition-all active:scale-90 cursor-pointer shadow-lg flex items-center justify-center shrink-0"
title="下一個月"
>
<LargeChevronRightIcon />
</button>
</div>
</header>

{/* Dedicated Actions Row */}
<div className="flex items-center gap-3">
<button
onClick={handleOpenCreateTransaction}
className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
>
<PlusIcon />
<span>新增記賬</span>
</button>

<button
onClick={() => setIsRecurringModalOpen(true)}
className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-sm font-semibold px-6 py-3 rounded-xl transition-all active:scale-95 shadow-sm cursor-pointer"
>
<RepeatIcon />
<span>恆常開支</span>
</button>

<button
onClick={() => setIsManageCategoriesModalOpen(true)}
className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold px-4 py-3 rounded-xl transition-all active:scale-95 cursor-pointer"
>
<SettingsIcon />
<span className="hidden xs:inline">自訂類別</span>
</button>
</div>

{/* Top Summary Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl relative overflow-hidden group">
<div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
<div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">本月總開支 (Total)</div>
<div className="text-3xl font-black text-white mt-2 tracking-tight">
HK$ {totalMonthlyAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
</div>
<div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
<span className="inline-flex items-center text-emerald-400 font-medium">
{monthlyTransactions.length} 筆明細紀錄
</span>
<span>•</span>
<span>{selectedMonth} 月</span>
</div>
</div>

<div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl relative overflow-hidden">
<div className="text-xs font-semibold text-purple-300 uppercase tracking-wider">折合每月固定恆常開支</div>
<div className="text-3xl font-black text-purple-200 mt-2 tracking-tight">
HK$ {Math.round(totalMonthlyRecurringEstimate).toLocaleString()}
</div>
<div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
<span>{recurringRules.length} 個固定訂閱/租金項目</span>
<button onClick={() => setIsRecurringModalOpen(true)} className="text-purple-400 hover:underline cursor-pointer">管理 ➔</button>
</div>
</div>
</div>

{/* Category Breakdown Progress Bar Section */}
<div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
<div>
<h2 className="text-base font-bold text-white flex items-center gap-2">
<span>開支類別比例 (Category Breakdown)</span>
{selectedCategoryFilter !== 'all' && (
<span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
已套用篩選
</span>
)}
</h2>
<p className="text-xs text-slate-400 mt-0.5">點擊下方任一類別即可快速篩選明細列表</p>
</div>

{selectedCategoryFilter !== 'all' ? (
<button
onClick={() => setSelectedCategoryFilter('all')}
className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 self-start sm:self-auto cursor-pointer"
>
<span>顯示全部類別</span>
<span className="font-bold text-slate-400">✕</span>
</button>
) : (
<span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 self-start sm:self-auto">
點擊類別進行篩選
</span>
)}
</div>

{/* Multi-segment Progress Bar */}
<div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800 gap-0.5">
{categoryBreakdown.map((cat) => (
cat.percentage > 0 && (
<button
key={cat.id}
type="button"
onClick={() => handleCategoryClick(cat.id)}
style={{ width: `${cat.percentage}%`, backgroundColor: cat.barColor }}
className={`h-full rounded-sm transition-all duration-300 hover:opacity-100 ${
selectedCategoryFilter === cat.id
? 'ring-2 ring-white z-10 opacity-100 scale-y-125 shadow-lg'
: selectedCategoryFilter === 'all' ? 'opacity-85 hover:scale-y-110' : 'opacity-30'
}`}
title={`${cat.name}: ${cat.percentage}% (點擊檢視紀錄)`}
/>
)
))}
</div>

{/* Category Cards Grid */}
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
{categoryBreakdown.map((cat) => {
const isSelected = selectedCategoryFilter === cat.id;
return (
<button
key={cat.id}
type="button"
onClick={() => handleCategoryClick(cat.id)}
className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden group ${
isSelected
? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
: 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
}`}
>
<div className="flex items-center justify-between mb-1.5">
<div className="flex items-center gap-2 truncate">
<div className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
<span className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
{cat.name}
</span>
</div>
{isSelected && (
<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
)}
</div>
<div className="text-sm font-bold text-slate-100">
HK$ {cat.amount.toLocaleString()}
</div>
<div className="flex items-center justify-between mt-1 text-[11px]">
<span className="text-slate-400 font-mono">{cat.percentage}%</span>
<span className={`text-[10px] transition-opacity ${isSelected ? 'text-emerald-400 font-medium' : 'text-slate-500 opacity-0 group-hover:opacity-100'}`}>
{isSelected ? '取消篩選' : '檢視明細'}
</span>
</div>
</button>
);
})}
</div>
</div>

{/* Transaction Details List Section */}
<div id="transaction-list-section" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
<div>
<div className="flex items-center gap-2">
<h2 className="text-base font-bold text-white">支出明細列表</h2>
{selectedCategoryFilter !== 'all' && (
<span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
{categories.find(c => c.id === selectedCategoryFilter)?.name} ({filteredTransactions.length} 筆)
</span>
)}
</div>
<p className="text-xs text-slate-400 mt-0.5">當前月份的所有單次與恆常支出紀錄</p>
</div>

<div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
<div className="relative flex-1 sm:w-48">
<div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
<SearchIcon />
</div>
<input
type="text"
placeholder="搜尋項目/備註/付款人/金額..."
value={searchQuery}
onChange={(e) => setSearchQuery(e.target.value)}
className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-8 pr-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
/>
</div>

<select
value={selectedCategoryFilter}
onChange={(e) => setSelectedCategoryFilter(e.target.value)}
className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
>
<option value="all">所有類別</option>
{categories.map(c => (
<option key={c.id} value={c.id}>{c.name}</option>
))}
</select>
</div>
</div>

<div className="space-y-2">
{filteredTransactions.length === 0 ? (
<div className="text-center py-10 text-slate-500 text-sm">
找不到符合條件的支出紀錄。
</div>
) : (
filteredTransactions.map((tx) => {
const categoryInfo = categories.find(c => c.id === tx.category);
return (
<div key={tx.id} className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 hover:border-slate-700 transition-colors">
<div className="flex items-center gap-3 min-w-0 flex-1">
<div className={`w-3 h-3 rounded-full shrink-0 ${categoryInfo?.color || 'bg-slate-500'}`} />
<div className="min-w-0 flex-1">
<div className="flex items-center gap-2 flex-wrap">
<span className="font-semibold text-slate-200 text-sm">{tx.title || categoryInfo?.name}</span>

<span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.2 rounded font-semibold whitespace-nowrap">
{tx.payer || 'YSK'}
</span>

<span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.2 rounded whitespace-nowrap">
{tx.paymentMethod || '信用卡'}
</span>

{tx.isRecurring && (
<span className="inline-flex items-center gap-1 text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.2 rounded whitespace-nowrap">
<RepeatIcon /> {FREQUENCIES.find(f => f.id === tx.frequency)?.name || '恆常'}
</span>
)}
</div>
<div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
<span className="whitespace-nowrap">{tx.date}</span>
<span>•</span>
<span className={`whitespace-nowrap ${categoryInfo?.textColor}`}>{categoryInfo?.name}</span>
{tx.note && (
<>
<span>•</span>
<span className="text-slate-400 italic">備註: {tx.note}</span>
</>
)}
</div>
</div>
</div>

<div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
<div className="text-right font-bold text-white text-sm whitespace-nowrap font-mono">
- HK$ {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
</div>
<div className="flex items-center gap-1 shrink-0">
<button
onClick={() => handleOpenEditTransaction(tx)}
className="text-slate-500 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors cursor-pointer"
title="修改紀錄"
>
<EditIcon />
</button>
<button
onClick={() => handleDeleteTransaction(tx.id)}
className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
title="刪除紀錄"
>
<TrashIcon />
</button>
</div>
</div>
</div>
);
})
)}
</div>
</div>

{/* Modal for Setting Cloud URL */}
{isCloudModalOpen && (
<div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
<div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
<h3 className="text-base font-bold text-white flex items-center gap-2">
<CloudIcon />
<span>設定 Google Sheets 雲端連線</span>
</h3>
<p className="text-xs text-slate-400">貼上你的 Google Apps Script Web App URL，系統便會自動將你的帳目備份至雲端。</p>

<input
type="text"
placeholder="https://script.google.com/macros/s/.../exec"
value={gasUrl}
onChange={(e) => setGasUrl(e.target.value)}
className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
/>

<div className="flex justify-end gap-2 pt-2">
<button onClick={() => setIsCloudModalOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white cursor-pointer">取消</button>
<button onClick={handleSaveGasUrl} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl cursor-pointer">
儲存並同步
</button>
</div>
</div>
</div>
)}

{/* Modal for Managing Categories and Presets */}
{isManageCategoriesModalOpen && (
<div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
<div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
<div className="flex items-center justify-between border-b border-slate-800 pb-3">
<h3 className="text-base font-bold text-white flex items-center gap-2">
<SettingsIcon />
<span>管理支出類別與預設快速項目</span>
</h3>
<button onClick={() => setIsManageCategoriesModalOpen(false)} className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer">✕</button>
</div>

{/* 新增/編輯類別表單 */}
<div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
<div className="flex justify-between items-center">
<h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
{editingCategoryId ? '✏️ 編輯類別' : '+ 新增自訂支出類別'}
</h4>
{editingCategoryId && (
<button
onClick={handleCancelEditCategory}
className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
>
取消編輯 (改為新增)
</button>
)}
</div>

<form onSubmit={handleSaveCategory} className="space-y-3">
<div>
<label className="block text-[11px] font-medium text-slate-300 mb-1">類別名稱</label>
<input
type="text"
placeholder="輸入類別名稱 (例：醫療健檢 / 旅遊)"
value={newCategoryName}
onChange={(e) => setNewCategoryName(e.target.value)}
className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
/>
</div>

<div>
<label className="block text-[11px] font-medium text-slate-300 mb-1">代表色彩標籤</label>
<div className="flex items-center gap-2 flex-wrap">
{COLOR_PALETTE.map((pal, idx) => (
<button
type="button"
key={pal.id}
onClick={() => setSelectedColorIndex(idx)}
className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
selectedColorIndex === idx
? 'bg-slate-800 border-emerald-500 text-white ring-2 ring-emerald-500/30'
: 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
}`}
>
<div className={`w-2.5 h-2.5 rounded-full ${pal.color}`} />
<span>{pal.name}</span>
</button>
))}
</div>
</div>

<div className="flex justify-end pt-1">
<button
type="submit"
className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
>
{editingCategoryId ? '儲存修改' : '新增此類別'}
</button>
</div>
</form>
</div>

{/* 現有類別列表與編輯/刪除管理 */}
<div className="space-y-2">
<h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">現有支出類別 ({categories.length})</h4>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
{categories.map((cat) => (
<div key={cat.id} className={`p-2.5 border rounded-xl flex items-center justify-between gap-2 transition-colors ${editingCategoryId === cat.id ? 'bg-slate-800 border-emerald-500/50' : 'bg-slate-950 border-slate-800'}`}>
<div className="flex items-center gap-2 min-w-0">
<div className={`w-3 h-3 rounded-full shrink-0 ${cat.color}`} />
<span className="text-xs font-semibold text-slate-200 truncate">{cat.name}</span>
</div>
<div className="flex items-center gap-1 shrink-0">
<button
onClick={() => handleEditCategory(cat)}
className="text-slate-500 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors cursor-pointer"
title="編輯此類別"
>
<EditIcon />
</button>
<button
onClick={() => handleDeleteCategory(cat.id)}
className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
title="刪除此類別"
>
<TrashIcon />
</button>
</div>
</div>
))}
</div>
</div>

{/* 各類別下的預設快捷項目 (Chips) 管理 */}
<div className="pt-4 border-t border-slate-800 space-y-3">
<h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">管理類別下的預設快捷項目</h4>

<div className="space-y-2">
<label className="block text-[11px] font-medium text-slate-300">選擇要編輯預設項目的類別</label>
<select
value={selectedCatForPresets}
onChange={(e) => setSelectedCatForPresets(e.target.value)}
className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer"
>
{categories.map(c => (
<option key={c.id} value={c.id}>{c.name}</option>
))}
</select>
</div>

<form onSubmit={handleAddPresetItem} className="flex gap-2">
<input
type="text"
placeholder="輸入新的快捷項目 (例：汽車保養 / 寵物飼料)"
value={newPresetItemName}
onChange={(e) => setNewPresetItemName(e.target.value)}
className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
/>
<button
type="submit"
className="bg-purple-500 hover:bg-purple-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-purple-500/20 cursor-pointer shrink-0"
>
+ 加入預設
</button>
</form>

<div className="space-y-1 pt-1">
<label className="block text-[11px] text-slate-400">目前「{categories.find(c => c.id === selectedCatForPresets)?.name}」類別的預設快捷按鈕：</label>
<div className="flex flex-wrap gap-1.5 p-2 bg-slate-950 border border-slate-800 rounded-xl min-h-[50px]">
{(categoryPresets[selectedCatForPresets] || []).length === 0 ? (
<span className="text-xs text-slate-500 italic p-1">暫無快捷項目</span>
) : (
(categoryPresets[selectedCatForPresets] || []).map((preset) => (
<span key={preset} className="inline-flex items-center gap-1.5 text-xs bg-slate-900 text-slate-300 border border-slate-700/80 px-2.5 py-1 rounded-lg">
<span>{preset}</span>
<button
type="button"
onClick={() => handleDeletePresetItem(selectedCatForPresets, preset)}
className="text-slate-500 hover:text-rose-400 font-bold ml-1 cursor-pointer"
title="刪除此快捷項目"
>
✕
</button>
</span>
))
)}
</div>
</div>
</div>

<div className="flex justify-end pt-2 border-t border-slate-800">
<button
type="button"
onClick={() => setIsManageCategoriesModalOpen(false)}
className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
>
完成並關閉
</button>
</div>
</div>
</div>
)}

{/* Modal for Creating / Editing Transaction */}
{isModalOpen && (
<div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
<div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
<div className="flex items-center justify-between border-b border-slate-800 pb-3">
<h3 className="text-base font-bold text-white">
{editingTxId ? '編輯支出紀錄' : '新增支出紀錄'}
</h3>
<button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer">✕</button>
</div>

<form onSubmit={handleAddTransaction} className="space-y-4">
<div>
<label className="block text-xs font-medium text-slate-300 mb-1">金額 (HK$)</label>
<input
type="number"
step="0.01"
placeholder="0.00"
required
value={formData.amount}
onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
className="w-full bg-slate-950 border border-slate-800 text-white text-lg font-bold rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
/>
</div>

<div className="grid grid-cols-2 gap-3">
<div>
<label className="block text-xs font-medium text-slate-300 mb-1">開支類別</label>
<select
value={formData.category}
onChange={(e) => setFormData({ ...formData, category: e.target.value })}
className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
>
{categories.map(c => (
<option key={c.id} value={c.id}>{c.name}</option>
))}
</select>
</div>

<div>
<label className="block text-xs font-medium text-slate-300 mb-1">日期</label>
<MiniCalendarPicker
value={formData.date}
onChange={(newDate) => setFormData({ ...formData, date: newDate })}
/>
</div>
</div>

<div className="space-y-2">
<label className="block text-xs font-medium text-slate-300">項目名稱</label>
<input
type="text"
placeholder="可直接手動輸入，或點擊下方快捷預設"
value={formData.title}
onChange={(e) => setFormData({ ...formData, title: e.target.value })}
className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
/>
<div className="flex flex-wrap gap-1.5 pt-0.5">
{(categoryPresets[formData.category] || []).map((preset) => (
<button
type="button"
key={preset}
onClick={() => setFormData({ ...formData, title: preset })}
className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all active:scale-95 cursor-pointer ${
formData.title === preset
? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
: 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
}`}
>
{preset}
</button>
))}
</div>
</div>

<div className="grid grid-cols-2 gap-3">
<div>
<label className="block text-xs font-medium text-slate-300 mb-1">付款人</label>
<select
value={formData.payer}
onChange={(e) => setFormData({ ...formData, payer: e.target.value })}
className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer font-medium"
>
{PAYERS.map(p => (
<option key={p} value={p}>{p}</option>
))}
</select>
</div>

<div>
<label className="block text-xs font-medium text-slate-300 mb-1">付款方式</label>
<select
value={formData.paymentMethod}
onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer font-medium"
>
{PAYMENT_METHODS.map(m => (
<option key={m} value={m}>{m}</option>
))}
</select>
</div>
</div>

<div>
<label className="block text-xs font-medium text-slate-300 mb-1">備註說明 (自由輸入)</label>
<input
type="text"
placeholder="選填備註說明 (例如：7月份電費單)"
value={formData.note}
onChange={(e) => setFormData({ ...formData, note: e.target.value })}
className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
/>
</div>

<div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
<div className="flex items-center justify-between">
<div>
<div className="text-xs font-medium text-slate-200">設為恆常支出</div>
<div className="text-[10px] text-slate-400">定期產生的固定費用</div>
</div>
<input
type="checkbox"
checked={formData.isRecurring}
onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
/>
</div>

{formData.isRecurring && (
<div className="pt-2 border-t border-slate-800 space-y-1.5">
<label className="block text-[11px] font-medium text-purple-300">扣款週期選項</label>
<div className="grid grid-cols-3 gap-2">
{FREQUENCIES.map(freq => (
<button
type="button"
key={freq.id}
onClick={() => setFormData({ ...formData, frequency: freq.id })}
className={`py-1.5 text-xs rounded-lg border font-medium transition-all cursor-pointer ${
formData.frequency === freq.id
? 'bg-purple-500/20 border-purple-500 text-purple-300'
: 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
}`}
>
{freq.name}
</button>
))}
</div>
</div>
)}
</div>

<div className="flex justify-end gap-2 pt-2">
<button
type="button"
onClick={() => setIsModalOpen(false)}
className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
>
取消
</button>
<button
type="submit"
className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
>
{editingTxId ? '儲存修改' : '確認儲存'}
</button>
</div>
</form>
</div>
</div>
)}

{/* Modal for Managing Recurring Expense Rules */}
{isRecurringModalOpen && (
<div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
<div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
<div className="flex items-center justify-between border-b border-slate-800 pb-4">
<div>
<h3 className="text-lg font-bold text-white flex items-center gap-2">
<RepeatIcon />
<span>恆常開支管理 (Recurring Expenses)</span>
</h3>
<p className="text-xs text-slate-400 mt-0.5">預設及管理定期發生的租金、訂閱與保險項目</p>
</div>
<button
onClick={() => setIsRecurringModalOpen(false)}
className="text-slate-400 hover:text-white p-1 text-sm font-bold cursor-pointer"
>
✕
</button>
</div>

<div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-between">
<div>
<div className="text-xs text-purple-300 font-medium">預估折合每月恆常總開支</div>
<div className="text-2xl font-black text-purple-200 mt-0.5">
HK$ {Math.round(totalMonthlyRecurringEstimate).toLocaleString()} <span className="text-xs font-normal text-slate-400">/ 月</span>
</div>
</div>
<div className="text-right text-[11px] text-slate-400">
包含每月、每季及每年<br />均攤後的每月固定預算
</div>
</div>

<div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
<button
onClick={() => setRecurringFilter('all')}
className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
recurringFilter === 'all'
? 'bg-purple-500 text-slate-950 font-bold'
: 'text-slate-400 hover:text-white hover:bg-slate-800'
}`}
>
全部 ({recurringRules.length})
</button>
{FREQUENCIES.map(freq => {
const count = recurringRules.filter(r => r.frequency === freq.id).length;
return (
<button
key={freq.id}
onClick={() => setRecurringFilter(freq.id)}
className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
recurringFilter === freq.id
? 'bg-purple-500 text-slate-950 font-bold'
: 'text-slate-400 hover:text-white hover:bg-slate-800'
}`}
>
{freq.name} ({count})
</button>
);
})}
</div>

{/* Recurring Rules Item List */}
<div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
{filteredRecurringRules.length === 0 ? (
<div className="text-center py-6 text-slate-500 text-xs">
此週期類別下尚無恆常開支項目。
</div>
) : (
filteredRecurringRules.map(rule => {
const categoryInfo = categories.find(c => c.id === rule.category);
const freqInfo = FREQUENCIES.find(f => f.id === rule.frequency);
const monthlyAverage = rule.amount / (freqInfo?.divider || 1);

return (
<div key={rule.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 hover:border-slate-700 transition-colors">
<div className="flex items-center gap-3 min-w-0 flex-1">
<div className={`w-3 h-3 rounded-full shrink-0 ${categoryInfo?.color || 'bg-slate-500'}`} />
<div className="min-w-0 flex-1">
<div className="flex items-center gap-2 flex-wrap">
<span className="text-sm font-semibold text-slate-200">{rule.title || categoryInfo?.name}</span>
<span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.2 rounded font-semibold whitespace-nowrap">
{rule.payer || 'YSK'}
</span>
<span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.2 rounded whitespace-nowrap">
{rule.paymentMethod || '信用卡'}
</span>
<span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded whitespace-nowrap">
{freqInfo?.name} (每月 {rule.dayOfMonth} 號)
</span>
</div>
<div className="text-[11px] text-slate-400 mt-0.5">
{categoryInfo?.name} • 扣款週期：{freqInfo?.label}
{rule.note && <span className="ml-2 italic text-slate-400">({rule.note})</span>}
</div>
</div>
</div>

<div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
<div className="text-right whitespace-nowrap">
<div className="text-sm font-bold text-white whitespace-nowrap font-mono">HK$ {rule.amount.toLocaleString()}</div>
{rule.frequency !== 'monthly' && (
<div className="text-[10px] text-purple-400 whitespace-nowrap">
約 HK$ {Math.round(monthlyAverage).toLocaleString()} / 月
</div>
)}
</div>
<div className="flex items-center gap-1 shrink-0">
<button
onClick={() => handleOpenEditRecurringRule(rule)}
className="text-slate-500 hover:text-purple-300 p-1.5 rounded-lg hover:bg-purple-500/10 transition-colors cursor-pointer"
title="修改恆常項目"
>
<EditIcon />
</button>
<button
onClick={() => handleDeleteRecurringRule(rule.id)}
className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
title="刪除恆常項目"
>
<TrashIcon />
</button>
</div>
</div>
</div>
);
})
)}
</div>

{/* Form for Adding / Editing Recurring Template */}
<div className="pt-4 border-t border-slate-800">
<div className="flex items-center justify-between mb-3">
<h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
{editingRuleId ? '編輯恆常開支範本' : '新增恆常開支範本'}
</h4>
{editingRuleId && (
<button
type="button"
onClick={handleCancelEditRecurringRule}
className="text-[11px] text-purple-400 hover:underline cursor-pointer"
>
取消編輯 (改為新增)
</button>
)}
</div>

<form onSubmit={handleAddRecurringRule} className="space-y-4">
<div>
<label className="block text-xs font-medium text-slate-300 mb-1">金額 (HK$)</label>
<input
type="number"
step="0.01"
placeholder="0.00"
required
value={newRecurringForm.amount}
onChange={(e) => setNewRecurringForm({ ...newRecurringForm, amount: e.target.value })}
className="w-full bg-slate-950 border border-slate-800 text-white text-lg font-bold rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
/>
</div>

<div>
<label className="block text-xs font-medium text-slate-300 mb-1">開支類別</label>
<select
value={newRecurringForm.category}
onChange={(e) => setNewRecurringForm({ ...newRecurringForm, category: e.target.value })}
className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer"
>
{categories.map(c => (
<option key={c.id} value={c.id}>{c.name}</option>
))}
</select>
</div>

<div className="space-y-2">
<label className="block text-xs font-medium text-slate-300">項目名稱</label>
<input
type="text"
placeholder="可直接手動輸入，或點擊下方快捷預設"
value={newRecurringForm.title}
onChange={(e) => setNewRecurringForm({ ...newRecurringForm, title: e.target.value })}
className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
/>
<div className="flex flex-wrap gap-1.5 pt-0.5">
{(categoryPresets[newRecurringForm.category] || []).map((preset) => (
<button
type="button"
key={preset}
onClick={() => setNewRecurringForm({ ...newRecurringForm, title: preset })}
className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all active:scale-95 cursor-pointer ${
newRecurringForm.title === preset
? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold'
: 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
}`}
>
{preset}
</button>
))}
</div>
</div>

<div className="grid grid-cols-2 gap-3">
<div>
<label className="block text-xs font-medium text-slate-300 mb-1">付款人</label>
<select
value={newRecurringForm.payer}
onChange={(e) => setNewRecurringForm({ ...newRecurringForm, payer: e.target.value })}
className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer font-medium"
>
{PAYERS.map(p => (
<option key={p} value={p}>{p}</option>
))}
</select>
</div>

<div>
<label className="block text-xs font-medium text-slate-300 mb-1">付款方式</label>
<select
value={newRecurringForm.paymentMethod}
onChange={(e) => setNewRecurringForm({ ...newRecurringForm, paymentMethod: e.target.value })}
className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer font-medium"
>
{PAYMENT_METHODS.map(m => (
<option key={m} value={m}>{m}</option>
))}
</select>
</div>
</div>

<div>
<label className="block text-xs font-medium text-slate-300 mb-1">備註說明 (自由輸入)</label>
<input
type="text"
placeholder="選填備註說明"
value={newRecurringForm.note}
onChange={(e) => setNewRecurringForm({ ...newRecurringForm, note: e.target.value })}
className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
/>
</div>

<div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
<div>
<div className="text-xs font-medium text-purple-300">扣款週期與預設扣款日</div>
<div className="text-[10px] text-slate-400">選擇固定費用的扣款頻次與每月指定扣款日</div>
</div>
<div className="flex items-center gap-1.5 self-end sm:self-auto">
<span className="text-xs text-slate-400">每月預設:</span>
<input
type="number"
min="1"
max="31"
required
placeholder="日"
value={newRecurringForm.dayOfMonth}
onChange={(e) => setNewRecurringForm({ ...newRecurringForm, dayOfMonth: e.target.value })}
className="w-16 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs text-center font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
/>
<span className="text-xs text-slate-400">號</span>
</div>
</div>

<div className="pt-2 border-t border-slate-800/80">
<label className="block text-[11px] font-medium text-purple-300 mb-1.5">週期選項</label>
<div className="grid grid-cols-3 gap-2">
{FREQUENCIES.map(freq => (
<button
type="button"
key={freq.id}
onClick={() => setNewRecurringForm({ ...newRecurringForm, frequency: freq.id })}
className={`py-2 text-xs rounded-lg border font-medium transition-all cursor-pointer ${
newRecurringForm.frequency === freq.id
? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold shadow-sm'
: 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
}`}
>
{freq.name}
</button>
))}
</div>
</div>
</div>

<div className="flex justify-end gap-2 pt-2">
{editingRuleId && (
<button
type="button"
onClick={handleCancelEditRecurringRule}
className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
>
取消
</button>
)}
<button
type="submit"
className="bg-purple-500 hover:bg-purple-600 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-purple-500/20 cursor-pointer"
>
{editingRuleId ? '儲存恆常修改' : '+ 新增至恆常開支'}
</button>
</div>
</form>
</div>

</div>
</div>
)}

</div>
</div>
);
}

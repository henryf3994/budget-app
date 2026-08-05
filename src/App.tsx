import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, RefreshCw, Settings, Database, Calendar, ChevronLeft, ChevronRight, 
  Trash2, Edit3, X, Check, CreditCard, DollarSign, User, Tag, FileText, 
  ChevronDown, PieChart, Lock, ArrowUpRight, CheckCircle2, Clock
} from 'lucide-react';

// 取得本地時區的 YYYY-MM-DD
const getLocalDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// 預設類別、顏色與常規標題選項
const INITIAL_CATEGORIES = [
  { id: 'cat_1', name: '住屋交通', color: '#6366f1', defaultTitles: ['供樓', '水費', '電費', '煤氣費', '管理費', '停車場', '車費', '汽油'] },
  { id: 'cat_2', name: '保險訂閱', color: '#3b82f6', defaultTitles: ['人壽保險', '醫療保險', 'Netflix', 'Spotify', 'iCloud', 'YouTube Premium'] },
  { id: 'cat_3', name: '購物娛樂', color: '#ec4899', defaultTitles: ['超市買餸', '外賣飲食', '網購服飾', '電子產品', '電影日用品'] },
  { id: 'cat_4', name: 'Riley', color: '#10b981', defaultTitles: ['奶粉', '尿片', '玩具', '補習費', '衣物', '醫療診所'] },
  { id: 'cat_5', name: 'Bulu', color: '#14b8a6', defaultTitles: ['貓糧/狗糧', '罐頭零食', '貓砂', '獸醫診所', '寵物美容'] },
  { id: 'cat_6', name: '工人', color: '#f59e0b', defaultTitles: ['月薪', '膳食費', '勞保', '機票', '日用品'] },
  { id: 'cat_7', name: '其他', color: '#8b5cf6', defaultTitles: ['雜項支出', '轉帳提款', '稅款', '人情禮物'] },
];

const PAYERS = ['YSK', 'FMH'];
const PAYMENT_METHODS = ['信用卡', '現金', '轉賬', 'Alipay'];

export default function App() {
  // --- State ---
  const [gasUrl, setGasUrl] = useState(() => localStorage.getItem('gas_app_url') || '');
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // 資料狀態
  const [transactions, setTransactions] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([
    { id: 'rec_1', title: '供樓', amount: 30000, category: '住屋交通', payer: 'FMH', paymentMethod: '轉賬', note: '房屋按揭', frequency: 'Monthly', dayOfMonth: 30 },
    { id: 'rec_2', title: '工人薪金', amount: 4800, category: '工人', payer: 'YSK', paymentMethod: '轉賬', note: '合約薪資', frequency: 'Monthly', dayOfMonth: 1 },
  ]);

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('app_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  // 日期選擇器狀態 (預設目前年月)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  // Modals 控制
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // 篩選與搜尋
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  // 新增交易表單 State
  const [newTrans, setNewTrans] = useState({
    date: getLocalDateString(),
    amount: '',
    category: INITIAL_CATEGORIES[0].name,
    title: '',
    payer: PAYERS[0],
    paymentMethod: PAYMENT_METHODS[0],
    customPaymentMethod: '',
    isCustomPayment: false,
    note: ''
  });

  // 新增恆常支出表單 State
  const [newRec, setNewRec] = useState({
    amount: '',
    category: INITIAL_CATEGORIES[0].name,
    title: '',
    payer: PAYERS[0],
    paymentMethod: PAYMENT_METHODS[0],
    note: '',
    frequency: 'Monthly',
    dayOfMonth: 1
  });

  // 新增/修改類別 State
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');
  const [newCatTitles, setNewCatTitles] = useState('');

  // 儲存類別設定至 localStorage
  useEffect(() => {
    localStorage.setItem('app_categories', JSON.stringify(categories));
  }, [categories]);

  // 載入資料
  const loadDataFromGAS = async (url = gasUrl) => {
    if (!url) {
      setShowUrlModal(true);
      return;
    }
    setLoading(true);
    setStatusMsg({ type: 'info', text: '正在連線至 Google Sheets 讀取數據...' });
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.status === 'success') {
        setTransactions(json.data || []);
        setRecurringExpenses(json.recurring || []);
        setStatusMsg({ type: 'success', text: '數據同步成功！' });
        setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
      } else {
        throw new Error(json.message || '無法取得數據');
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: '同步失敗: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gasUrl) {
      loadDataFromGAS(gasUrl);
    }
  }, []);

  // 儲存 GAS URL
  const handleSaveUrl = () => {
    localStorage.setItem('gas_app_url', gasUrl);
    setShowUrlModal(false);
    loadDataFromGAS(gasUrl);
  };

  // 當選擇類別切換時，更新單據對應類別
  const handleCategoryChangeForNewTrans = (catName) => {
    setNewTrans(prev => ({
      ...prev,
      category: catName,
    }));
  };

  // 提交新增交易
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newTrans.amount || !newTrans.title) {
      alert('請填寫金額與項目標題！');
      return;
    }

    const payload = {
      action: 'addTransaction',
      date: newTrans.date,
      amount: parseFloat(newTrans.amount),
      category: newTrans.category,
      title: newTrans.title,
      payer: newTrans.payer,
      paymentMethod: newTrans.isCustomPayment ? newTrans.customPaymentMethod : newTrans.paymentMethod,
      note: newTrans.note
    };

    // 本地先更新預覽
    const tempId = 'temp_' + Date.now();
    setTransactions(prev => [{ ...payload, id: tempId }, ...prev]);
    setShowAddModal(false);

    // 重置表單
    setNewTrans({
      date: getLocalDateString(),
      amount: '',
      category: categories[0]?.name || '其他',
      title: '',
      payer: PAYERS[0],
      paymentMethod: PAYMENT_METHODS[0],
      customPaymentMethod: '',
      isCustomPayment: false,
      note: ''
    });

    // 如果有 GAS URL 則寫入雲端
    if (gasUrl) {
      setLoading(true);
      try {
        const res = await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          redirect: 'follow',
          body: JSON.stringify(payload)
        });
        const resJson = await res.json();
        if (resJson.status === 'success') {
          loadDataFromGAS();
        } else {
          alert('寫入失敗：' + resJson.message);
        }
      } catch (err) {
        alert('發送至 Google Sheets 時發生錯誤：' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // 新增恆常開支
const handleAddRecurring = async (e) => {
    e.preventDefault();
    if (!newRec.amount || !newRec.title) return;
    
    const payload = {
      action: 'addRecurring', // 告訴後端這是新增恆常開支
      ...newRec,
      amount: parseFloat(newRec.amount),
      dayOfMonth: parseInt(newRec.dayOfMonth) || 1
    };

    // 前端搶先更新 (Optimistic UI) 讓使用者感覺順暢
    const tempId = 'rec_' + Date.now();
    setRecurringExpenses(prev => [...prev, { ...payload, id: tempId }]);
    setShowRecurringModal(false);

    // 清空表單
    setNewRec({
      amount: '',
      category: categories[0]?.name || '其他',
      title: '',
      payer: PAYERS[0],
      paymentMethod: PAYMENT_METHODS[0],
      note: '',
      frequency: 'Monthly',
      dayOfMonth: 1
    });

    if (gasUrl) {
      setLoading(true);
      try {
        const res = await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          redirect: 'follow',
          body: JSON.stringify(payload)
        });
        const resJson = await res.json();
        if (resJson.status === 'success') {
          loadDataFromGAS(); // 寫入成功後重新拉取資料，確保 ID 與 Google Sheet 對齊
        } else {
          alert('恆常開支寫入失敗：' + resJson.message);
        }
      } catch (err) {
        alert('發送至 Google Sheets 時發生錯誤：' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // 新增自訂類別
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const defaultTitlesArr = newCatTitles
      .split(/[,，\n]/)
      .map(t => t.trim())
      .filter(Boolean);

    const newCat = {
      id: 'cat_' + Date.now(),
      name: newCatName.trim(),
      color: newCatColor,
      defaultTitles: defaultTitlesArr.length > 0 ? defaultTitlesArr : ['一般支出']
    };
    setCategories(prev => [...prev, newCat]);
    setNewCatName('');
    setNewCatTitles('');
  };

  // 刪除類別
  const handleDeleteCategory = (catId) => {
    if (categories.length <= 1) {
      alert('最少需保留一個類別！');
      return;
    }
    setCategories(prev => prev.filter(c => c.id !== catId));
  };

  // --- 計算當月資料 ---
  const formattedMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (!t.date) return false;
      return t.date.startsWith(formattedMonthStr);
    });
  }, [transactions, formattedMonthStr]);

  // 總開支
  const totalExpense = useMemo(() => {
    return currentMonthTransactions.reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);
  }, [currentMonthTransactions]);

  // 恆常總開支
  const totalRecurringExpense = useMemo(() => {
    return recurringExpenses.reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);
  }, [recurringExpenses]);

  // 類別統計金額
  const categoryBreakdown = useMemo(() => {
    const map = {};
    categories.forEach(c => { map[c.name] = 0; });
    
    currentMonthTransactions.forEach(t => {
      const catName = t.category || '其他';
      if (map[catName] !== undefined) {
        map[catName] += (Number(t.amount) || 0);
      } else {
        map[catName] = (Number(t.amount) || 0);
      }
    });

    return categories.map(c => ({
      ...c,
      total: map[c.name] || 0,
      percentage: totalExpense > 0 ? (((map[c.name] || 0) / totalExpense) * 100).toFixed(1) : '0.0'
    }));
  }, [currentMonthTransactions, categories, totalExpense]);

  // 根據搜尋與類別篩選列表
  const filteredTransactions = useMemo(() => {
    return currentMonthTransactions.filter(t => {
      const matchCategory = selectedCategoryFilter === 'ALL' || t.category === selectedCategoryFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || 
        (t.title && String(t.title).toLowerCase().includes(q)) ||
        (t.payer && String(t.payer).toLowerCase().includes(q)) ||
        (t.paymentMethod && String(t.paymentMethod).toLowerCase().includes(q)) ||
        (t.note && String(t.note).toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [currentMonthTransactions, selectedCategoryFilter, searchQuery]);

  // 切換月份
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(prev => prev - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(prev => prev + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // 取得該類別的輔助顏色
  const getCategoryColor = (catName) => {
    const found = categories.find(c => c.name === catName);
    return found ? found.color : '#8b5cf6';
  };

  // 當前選取類別的熱門標題列表
  const currentCategoryTitles = useMemo(() => {
    const found = categories.find(c => c.name === newTrans.category);
    return found ? (found.defaultTitles || []) : [];
  }, [newTrans.category, categories]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 font-sans p-3 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* --- 頂部 Header --- */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowUrlModal(true)}
              className={`p-2.5 rounded-xl border transition-all ${
                gasUrl 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 animate-pulse'
              }`}
              title="設定 GAS API URL"
            >
              <Database className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => loadDataFromGAS()}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="重新整理數據"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                私人記帳本
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-normal">
                  Cloud DB Sync
                </span>
              </h1>
            </div>
          </div>

          {/* 月份切換器 */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-inner">
            <button 
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 font-semibold text-sm sm:text-base tracking-wider min-w-[120px] text-center">
              {currentYear}年{String(currentMonth).padStart(2, '0')}月
            </div>
            <button 
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button 
            onClick={() => setShowCategoryModal(true)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="管理類別與顏色"
          >
            <Settings className="w-5 h-5" />
          </button>
        </header>

        {/* 狀態提示 */}
        {statusMsg.text && (
          <div className={`p-3 rounded-xl border text-sm flex items-center gap-2 ${
            statusMsg.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
            statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
            'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
          }`}>
            <Clock className="w-4 h-4 animate-spin" />
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* --- 功能按鈕區 --- */}
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-emerald-900/20 transition hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>新增記帳</span>
          </button>

          <button 
            onClick={() => setShowRecurringModal(true)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-900/20 transition hover:scale-[1.02] active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>恆常開支</span>
          </button>
        </div>

        {/* --- 資訊統計卡片 --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            <div className="text-xs font-medium text-slate-400 tracking-wider uppercase mb-1">
              本月總開支 (TOTAL)
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              HK$ {totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-3 text-xs text-slate-500 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              共 {currentMonthTransactions.length} 筆明細紀錄
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
            <div className="text-xs font-medium text-slate-400 tracking-wider uppercase mb-1">
              折合每月固定恆常開支
            </div>
            <div className="text-3xl font-extrabold text-indigo-300 tracking-tight">
              HK$ {totalRecurringExpense.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="mt-3 text-xs text-indigo-400/80 flex items-center gap-2">
              <span>{recurringExpenses.length} 個預定訂閱/恆常項目</span>
            </div>
          </div>
        </div>

        {/* --- 類別比例 (Category Breakdown) --- */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center justify-between">
            <span>開支類別比例 (Category Breakdown)</span>
            <span className="text-xs text-slate-500 font-normal">點擊下方分類可快速篩選列表</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {categoryBreakdown.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(selectedCategoryFilter === cat.name ? 'ALL' : cat.name)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedCategoryFilter === cat.name
                    ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500'
                    : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  <span className="text-xs font-medium text-slate-300 truncate">{cat.name}</span>
                </div>
                <div className="text-sm font-bold text-white truncate">
                  HK$ {cat.total.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {cat.percentage}%
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* --- 支出明細列表 --- */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          {/* 搜尋與過濾 Bar */}
          <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              支出明細列表
              {selectedCategoryFilter !== 'ALL' && (
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  {selectedCategoryFilter}
                  <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setSelectedCategoryFilter('ALL')} />
                </span>
              )}
            </h3>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input 
                type="text"
                placeholder="搜尋項目/付款人/備註..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
              />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">所有類別</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 列表內容 */}
          <div className="divide-y divide-slate-800/60">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>當月暫無相關記帳紀錄</p>
              </div>
            ) : (
              filteredTransactions.map((item, idx) => {
                const catColor = getCategoryColor(item.category);
                return (
                  <div key={item.id || idx} className="p-4 hover:bg-slate-800/40 transition flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: catColor }} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-white">{item.title}</span>
                          {item.payer && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                              {item.payer}
                            </span>
                          )}
                          {item.paymentMethod && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              {item.paymentMethod}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <span>{item.date}</span>
                          <span>•</span>
                          <span>{item.category || '其他'}</span>
                          {item.note && (
                            <>
                              <span>•</span>
                              <span className="text-slate-400 italic">{item.note}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-slate-100">
                        - HK$ {Number(item.amount).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: 新增記帳 */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              新增支出記帳
            </h3>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              {/* 日期 */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">日期 (date)</label>
                <input 
                  type="date"
                  required
                  value={newTrans.date}
                  onChange={(e) => setNewTrans({ ...newTrans, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 金額 */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">金額 (amount)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-semibold">HK$</span>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newTrans.amount}
                    onChange={(e) => setNewTrans({ ...newTrans, amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-3 py-2 text-slate-100 text-base font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* 類別 */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">類別 (category)</label>
                <select 
                  value={newTrans.category}
                  onChange={(e) => handleCategoryChangeForNewTrans(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* 項目名稱 / 熱門標題選擇 */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">項目標題 (title)</label>
                <input 
                  type="text"
                  required
                  placeholder="請輸入或點選下方預設標題"
                  value={newTrans.title}
                  onChange={(e) => setNewTrans({ ...newTrans, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />

                {/* 熱門預設標題按鈕 */}
                {currentCategoryTitles.length > 0 && (
                  <div className="mt-2">
                    <span className="text-[11px] text-slate-500 block mb-1">快速選取熱門標題：</span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentCategoryTitles.map((t, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setNewTrans(prev => ({ ...prev, title: t }))}
                          className="text-xs px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700/80 transition"
                        >
                          + {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 付款人 payer */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">付款人 (payer)</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYERS.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTrans({ ...newTrans, payer: p })}
                      className={`py-2 px-3 rounded-xl border text-sm font-semibold transition ${
                        newTrans.payer === p
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* 付款方式 paymentMethod */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">付款方式 (paymentMethod)</label>
                
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {PAYMENT_METHODS.map(pm => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setNewTrans({ ...newTrans, paymentMethod: pm, isCustomPayment: false })}
                      className={`py-1.5 px-3 rounded-xl border text-xs font-medium transition ${
                        !newTrans.isCustomPayment && newTrans.paymentMethod === pm
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>

                {/* 自訂付款方式 */}
                <div className="mt-1">
                  <input 
                    type="text"
                    placeholder="自訂其他付款方式..."
                    value={newTrans.customPaymentMethod}
                    onChange={(e) => setNewTrans({ 
                      ...newTrans, 
                      customPaymentMethod: e.target.value,
                      isCustomPayment: true 
                    })}
                    className={`w-full bg-slate-950 border rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none ${
                      newTrans.isCustomPayment ? 'border-emerald-500' : 'border-slate-800'
                    }`}
                  />
                </div>
              </div>

              {/* 備註 */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">備註 (note)</label>
                <input 
                  type="text"
                  placeholder="可留空"
                  value={newTrans.note}
                  onChange={(e) => setNewTrans({ ...newTrans, note: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-900/30 transition"
                >
                  {loading ? '正在提交中...' : '確認新增記帳'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: 恆常開支管理 */}
      {/* ========================================================================= */}
      {showRecurringModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowRecurringModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-400" />
              恆常固定支出 (Recurring Expenses)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              設定每月扣款日 (`dayOfMonth`)，GAS 每日排程自動產生交易至記帳本。
            </p>

            {/* 新增恆常支出表單 */}
            <form onSubmit={handleAddRecurring} className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl space-y-3 mb-6">
              <div className="text-xs font-semibold text-indigo-300">新增恆常開支設定：</div>
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="標題 (title)*"
                  required
                  value={newRec.title}
                  onChange={(e) => setNewRec({ ...newRec, title: e.target.value })}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <input 
                  type="number" 
                  placeholder="金額 (amount)*"
                  required
                  value={newRec.amount}
                  onChange={(e) => setNewRec({ ...newRec, amount: e.target.value })}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <select 
                  value={newRec.category}
                  onChange={(e) => setNewRec({ ...newRec, category: e.target.value })}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>

                <select 
                  value={newRec.payer}
                  onChange={(e) => setNewRec({ ...newRec, payer: e.target.value })}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                >
                  {PAYERS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>

                <select 
                  value={newRec.paymentMethod}
                  onChange={(e) => setNewRec({ ...newRec, paymentMethod: e.target.value })}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                >
                  {PAYMENT_METHODS.map(pm => (
                    <option key={pm} value={pm}>{pm}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 shrink-0">每月扣款日:</span>
                  <input 
                    type="number" 
                    min="1" 
                    max="31" 
                    value={newRec.dayOfMonth}
                    onChange={(e) => setNewRec({ ...newRec, dayOfMonth: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-100 text-center"
                  />
                  <span className="text-xs text-slate-400">號</span>
                </div>
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg py-1.5 transition"
                >
                  + 新增恆常項目
                </button>
              </div>
            </form>

            {/* 現有恆常開支清單 */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {recurringExpenses.map(item => (
                <div key={item.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      {item.title}
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                        每月 {item.dayOfMonth} 號扣款
                      </span>
                    </div>
                    <div className="text-slate-400 mt-0.5">
                      {item.category} • {item.payer} • {item.paymentMethod}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-indigo-300">HK$ {item.amount}</span>
                    <button 
                      onClick={() => handleDeleteRecurring(item.id)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: 類別與顏色設定 */}
      {/* ========================================================================= */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowCategoryModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              類別與熱門標題管理
            </h3>

            {/* 新增類別 */}
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl mb-4 space-y-2">
              <div className="text-xs font-semibold text-slate-300">新增分類與快速標題：</div>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                />
                <input 
                  type="text" 
                  placeholder="類別名稱 (如: 寵物生活)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>
              <input 
                type="text" 
                placeholder="預設熱門標題，用逗號分隔 (如: 糧食, 診所, 玩具)"
                value={newCatTitles}
                onChange={(e) => setNewCatTitles(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
              />
              <button 
                onClick={handleAddCategory}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-1.5 rounded-lg transition"
              >
                + 新增類別
              </button>
            </div>

            {/* 現有類別列表 */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.map(cat => (
                <div key={cat.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    <div>
                      <div className="text-sm font-semibold text-white">{cat.name}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                        預設: {cat.defaultTitles ? cat.defaultTitles.join(', ') : '無'}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: 設定 GAS API URL */}
      {/* ========================================================================= */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowUrlModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              設定 Google Apps Script URL
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              請貼上部署為「網頁應用程式 (Web App)」時獲得的 `https://script.google.com/macros/s/.../exec` 網址。
            </p>

            <input 
              type="text"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={gasUrl}
              onChange={(e) => setGasUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500 mb-4"
            />

            <button 
              onClick={handleSaveUrl}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-xl transition"
            >
              儲存並連線
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

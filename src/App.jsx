import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, RefreshCw, Settings, Database, Calendar, ChevronLeft, ChevronRight, 
  Trash2, Edit3, X, Check, CreditCard, DollarSign, User, Tag, FileText, 
  ChevronDown, PieChart, Lock, ArrowUpRight, CheckCircle2, Clock, List
} from 'lucide-react';

import HeaderBar from './components/HeaderBar';
import SummaryCards from './components/SummaryCards';
import CategoryBreakdown from './components/CategoryBreakdown';
import ExpenseTrendChart from './components/ExpenseTrendChart';
import TransactionList from './components/TransactionList';
import UrlModal from './components/modals/UrlModal';
import CategoryModal from './components/modals/CategoryModal';
import RecurringModal from './components/modals/RecurringModal';
import AddTransactionModal from './components/modals/AddTransactionModal';
import EditTransactionModal from './components/modals/EditTransactionModal';
import { INITIAL_CATEGORIES } from './utils/constants.js';
import { ensureValidCategories, isValidUrl, normalizePaymentMethod, sanitizeRecurring, sanitizeText, sanitizeTransaction, validateRecurringForm, validateTransactionForm } from './utils/validation.js';

export default function App() {
  // --- Global States ---
  const [activeTab, setActiveTab] = useState('overview');
  const [gasUrl, setGasUrl] = useState(() => localStorage.getItem('gas_app_url') || '');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const [transactions, setTransactions] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('app_categories');
      if (!saved) return INITIAL_CATEGORIES;
      return ensureValidCategories(JSON.parse(saved));
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  // --- Modal States ---
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // --- Filter States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  useEffect(() => {
    localStorage.setItem('app_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    if (gasUrl) {
      loadDataFromGAS(gasUrl);
    }
  }, []);

  // --- API 請求與數據處理 ---
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
        // 修復重點 1：正確解構 GAS 回傳的 data 物件，確保必定為陣列
        const fetchedTransactions = Array.isArray(json.transactions)
          ? json.transactions
          : Array.isArray(json.data?.transactions)
          ? json.data.transactions
          : Array.isArray(json.data)
          ? json.data
          : [];

        const fetchedRecurring = Array.isArray(json.recurring)
          ? json.recurring
          : Array.isArray(json.data?.recurring)
          ? json.data.recurring
          : [];

        // 修復重點 3：清洗 GAS 回傳資料，確保欄位安全
        setTransactions(fetchedTransactions.map(sanitizeTransaction).filter(Boolean));
        setRecurringExpenses(fetchedRecurring.map(sanitizeRecurring).filter(Boolean));

        setStatusMsg({ type: 'success', text: '數據同步成功！' });
        setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
      } else {
        throw new Error(json.message || '無法取得數據');
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: '同步失敗: ' + err.message });
      // 防止失敗時 state 變為 undefined 造成後續 filter 崩潰
      setTransactions([]);
      setRecurringExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUrl = (url) => {
    const normalizedUrl = sanitizeText(url);
    if (!normalizedUrl) {
      setStatusMsg({ type: 'error', text: '請先輸入 GAS URL' });
      return;
    }
    if (!isValidUrl(normalizedUrl)) {
      setStatusMsg({ type: 'error', text: '請輸入有效的 URL（需以 http:// 或 https:// 開頭）' });
      return;
    }

    setGasUrl(normalizedUrl);
    localStorage.setItem('gas_app_url', normalizedUrl);
    setShowUrlModal(false);
    loadDataFromGAS(normalizedUrl);
  };

  const handleAddTransaction = async (formData) => {
    const validationError = validateTransactionForm(formData);
    if (validationError) {
      alert(validationError);
      return;
    }

    const payload = {
      action: 'addTransaction',
      ...formData,
      title: sanitizeText(formData.title),
      paymentMethod: normalizePaymentMethod(formData),
      amount: Number(formData.amount)
    };

    const tempId = 'temp_' + Date.now();
    setTransactions(prev => [{ ...payload, id: tempId }, ...(Array.isArray(prev) ? prev : [])]);
    setShowAddModal(false);

    if (gasUrl) {
      setLoading(true);
      try {
        const res = await fetch(gasUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), redirect: 'follow' });
        const resJson = await res.json();
        if (resJson.status === 'success') loadDataFromGAS();
        else {
          alert('寫入失敗：' + resJson.message);
          // 回滾樂觀更新
          setTransactions(prev => (Array.isArray(prev) ? prev : []).filter(t => t.id !== tempId));
        }
      } catch (err) {
        alert('發生錯誤：' + err.message);
        // 回滾樂觀更新
        setTransactions(prev => (Array.isArray(prev) ? prev : []).filter(t => t.id !== tempId));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateTransaction = async (formData) => {
    const validationError = validateTransactionForm(formData);
    if (validationError) {
      alert(validationError);
      return;
    }

    if (!formData?.id) {
      alert('無法更新：缺少交易 ID');
      return;
    }

    const payload = {
      action: 'editTransaction',
      ...formData,
      title: sanitizeText(formData.title),
      paymentMethod: normalizePaymentMethod(formData),
      amount: Number(formData.amount)
    };

    setTransactions(prev => (Array.isArray(prev) ? prev : []).map(t => t.id === payload.id ? payload : t));
    setEditingTransaction(null);

    if (gasUrl) {
      setLoading(true);
      try {
        const res = await fetch(gasUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), redirect: 'follow' });
        const resJson = await res.json();
        if (resJson.status === 'success') loadDataFromGAS();
        else alert('更新失敗：' + resJson.message);
      } catch (err) {
        alert('更新請求失敗：' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('確定要刪除這筆支出紀錄嗎？')) return;
    setTransactions(prev => (Array.isArray(prev) ? prev : []).filter(t => t.id !== id));
    if (gasUrl) {
      setLoading(true);
      try {
        const res = await fetch(gasUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'deleteTransaction', id: id }), redirect: 'follow' });
        const resJson = await res.json();
        if (resJson.status !== 'success') { alert('刪除失敗：' + resJson.message); loadDataFromGAS(); }
      } catch (err) {
        alert('刪除請求失敗：' + err.message); loadDataFromGAS();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddRecurring = async (formData) => {
    const validationError = validateRecurringForm(formData);
    if (validationError) {
      alert(validationError);
      return;
    }

    const dayOfMonth = parseInt(formData.dayOfMonth, 10);
    const safeDayOfMonth = Number.isNaN(dayOfMonth) ? 1 : dayOfMonth;
    const payload = {
      action: 'addRecurring',
      ...formData,
      title: sanitizeText(formData.title),
      paymentMethod: normalizePaymentMethod(formData),
      amount: Number(formData.amount),
      dayOfMonth: safeDayOfMonth
    };

    const tempId = 'rec_' + Date.now();
    setRecurringExpenses(prev => [...(Array.isArray(prev) ? prev : []), { ...payload, id: tempId }]);

    if (gasUrl) {
      setLoading(true);
      try {
        const res = await fetch(gasUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), redirect: 'follow' });
        const resJson = await res.json();
        if (resJson.status === 'success') loadDataFromGAS();
        else {
          alert('恆常開支寫入失敗：' + resJson.message);
          // 回滾樂觀更新
          setRecurringExpenses(prev => (Array.isArray(prev) ? prev : []).filter(r => r.id !== tempId));
        }
      } catch (err) {
        alert('發生錯誤：' + err.message);
        // 回滾樂觀更新
        setRecurringExpenses(prev => (Array.isArray(prev) ? prev : []).filter(r => r.id !== tempId));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteRecurring = async (id) => {
    if (!window.confirm('確定要刪除這筆恆常開支嗎？')) return;
    setRecurringExpenses(prev => (Array.isArray(prev) ? prev : []).filter(r => r.id !== id));
    if (gasUrl) {
      setLoading(true);
      try {
        const res = await fetch(gasUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'deleteRecurring', id: id }), redirect: 'follow' });
        const resJson = await res.json();
        if (resJson.status !== 'success') { alert('刪除失敗：' + resJson.message); loadDataFromGAS(); }
      } catch (err) {
        alert('刪除請求失敗：' + err.message); loadDataFromGAS();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddCategory = (newCat) => setCategories(prev => [...prev, newCat]);
  
  const handleDeleteCategory = (catId) => {
    if (categories.length <= 1) return alert('最少需保留一個類別！');
    const catToDelete = categories.find(c => c.id === catId);
    if (!catToDelete) return;
    
    // 檢查是否有交易引用此類別
    const relatedCount = (Array.isArray(transactions) ? transactions : []).filter(t => t?.category === catToDelete.name).length;
    if (relatedCount > 0) {
      const confirmed = window.confirm(`此類別「${catToDelete.name}」有 ${relatedCount} 筆交易紀錄，刪除後將歸入「其他」類別。確定要刪除嗎？`);
      if (!confirmed) return;
    }
    setCategories(prev => prev.filter(c => c.id !== catId));
  };

  // --- 安全資料計算 ---
  const formattedMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  const currentMonthTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    return transactions.filter(t => {
      if (!t || !t.date) return false;
      // 修復重點 2：安全解析日期（支援 ISO 字串與 yyyy-MM-dd）
      const dateStr = String(t.date).slice(0, 10);
      return dateStr.startsWith(formattedMonthStr);
    });
  }, [transactions, formattedMonthStr]);

  const totalExpense = useMemo(() => {
    return currentMonthTransactions.reduce((acc, cur) => acc + (Number(cur?.amount) || 0), 0);
  }, [currentMonthTransactions]);

  const totalRecurringExpense = useMemo(() => {
    if (!Array.isArray(recurringExpenses)) return 0;
    return recurringExpenses.reduce((acc, cur) => acc + (Number(cur?.amount) || 0), 0);
  }, [recurringExpenses]);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    if (Array.isArray(categories)) {
      categories.forEach(c => { if (c?.name) map[c.name] = 0; });
    }

    // 收集不在 app 類別清單中的未知類別金額
    const knownNames = new Set((categories || []).map(c => c?.name).filter(Boolean));
    let unknownTotal = 0;

    currentMonthTransactions.forEach(t => {
      const catName = t?.category || '其他';
      if (knownNames.has(catName)) {
        map[catName] = (map[catName] || 0) + (Number(t?.amount) || 0);
      } else {
        unknownTotal += (Number(t?.amount) || 0);
      }
    });

    const breakdown = (categories || []).map(c => ({
      ...c,
      total: map[c.name] || 0,
      percentage: totalExpense > 0 ? (((map[c.name] || 0) / totalExpense) * 100).toFixed(1) : '0.0'
    }));

    // 若有未知類別，將其併入「其他」類別（若存在）或新增一個「其他」項目
    if (unknownTotal > 0) {
      const otherCat = breakdown.find(c => c.name === '其他');
      if (otherCat) {
        otherCat.total += unknownTotal;
        otherCat.percentage = totalExpense > 0 ? ((otherCat.total / totalExpense) * 100).toFixed(1) : '0.0';
      } else {
        breakdown.push({
          id: 'cat_unknown',
          name: '其他',
          color: '#8b5cf6',
          total: unknownTotal,
          percentage: totalExpense > 0 ? ((unknownTotal / totalExpense) * 100).toFixed(1) : '0.0'
        });
      }
    }

    return breakdown;
  }, [currentMonthTransactions, categories, totalExpense]);

  const filteredTransactions = useMemo(() => {
    return currentMonthTransactions.filter(t => {
      if (!t) return false;
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

  // --- Render ---
  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 font-sans p-3 sm:p-6 md:p-8 pb-24">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header 組件 */}
        <HeaderBar 
          gasUrl={gasUrl}
          loading={loading}
          currentYear={currentYear}
          currentMonth={currentMonth}
          onPrevMonth={() => currentMonth === 1 ? (setCurrentYear(y => y - 1), setCurrentMonth(12)) : setCurrentMonth(m => m - 1)}
          onNextMonth={() => currentMonth === 12 ? (setCurrentYear(y => y + 1), setCurrentMonth(1)) : setCurrentMonth(m => m + 1)}
          onRefresh={() => loadDataFromGAS()}
          onOpenUrlModal={() => setShowUrlModal(true)}
          onOpenCategoryModal={() => setShowCategoryModal(true)}
        />

        {/* 系統狀態提示 */}
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

        {/* --- 分頁 1: 總覽 --- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid w-full grid-cols-2 gap-3">
              <button onClick={() => setShowAddModal(true)} className="flex w-full items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 rounded-xl font-medium text-base shadow-lg shadow-emerald-900/20 transition hover:scale-[1.02] active:scale-95">
                <Plus className="w-5 h-5" /><span>新增記帳</span>
              </button>
              <button onClick={() => setShowRecurringModal(true)} className="flex w-full items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-xl font-medium text-base shadow-lg shadow-indigo-900/20 transition hover:scale-[1.02] active:scale-95">
                <RefreshCw className="w-4 h-4" /><span>恆常開支</span>
              </button>
            </div>

            <SummaryCards 
              totalExpense={totalExpense}
              transactionCount={currentMonthTransactions.length}
              totalRecurringExpense={totalRecurringExpense}
              recurringCount={Array.isArray(recurringExpenses) ? recurringExpenses.length : 0}
            />

            <CategoryBreakdown 
              breakdownData={categoryBreakdown}
              selectedCategoryFilter={selectedCategoryFilter}
              onCategoryFilterChange={setSelectedCategoryFilter}
            />

            <ExpenseTrendChart 
              transactions={transactions}
              categories={categories}
              currentYear={currentYear}
              currentMonth={currentMonth}
              onMonthSelect={(year, month) => {
                setCurrentYear(year);
                setCurrentMonth(month);
              }}
            />
          </div>
        )}

        {/* --- 分頁 2: 支帳明細 --- */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <TransactionList 
              transactions={filteredTransactions}
              categories={categories}
              selectedCategoryFilter={selectedCategoryFilter}
              onCategoryFilterChange={setSelectedCategoryFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onEdit={setEditingTransaction}
              onDelete={handleDeleteTransaction}
            />
          </div>
        )}

      </div>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-full flex items-center shadow-2xl z-40">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
            activeTab === 'overview' 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span className="hidden sm:inline">總覽</span>
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
            activeTab === 'transactions' 
              ? 'bg-emerald-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <List className="w-5 h-5" />
          <span className="hidden sm:inline">支帳明細</span>
        </button>
      </div>

      {/* --- Modals --- */}
      {showUrlModal && <UrlModal initialUrl={gasUrl} onClose={() => setShowUrlModal(false)} onSave={handleSaveUrl} />}
      {showCategoryModal && <CategoryModal categories={categories} onClose={() => setShowCategoryModal(false)} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} />}
      {showRecurringModal && <RecurringModal recurringExpenses={recurringExpenses} categories={categories} onClose={() => setShowRecurringModal(false)} onAdd={handleAddRecurring} onDelete={handleDeleteRecurring} loading={loading} />}
      {showAddModal && <AddTransactionModal categories={categories} onClose={() => setShowAddModal(false)} onSubmit={handleAddTransaction} loading={loading} />}
      {editingTransaction && <EditTransactionModal transaction={editingTransaction} categories={categories} onClose={() => setEditingTransaction(null)} onSubmit={handleUpdateTransaction} loading={loading} />}
      
    </div>
  );
}

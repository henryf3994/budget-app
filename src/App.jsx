import { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, RefreshCw, Settings, PieChart, Clock, List } from 'lucide-react';

import HeaderBar from './components/HeaderBar';
import SummaryCards from './components/SummaryCards';
import CategoryBreakdown from './components/CategoryBreakdown';
import ExpenseTrendChart from './components/ExpenseTrendChart';
import TransactionList from './components/TransactionList';
import RecurringExpenseList from './components/RecurringExpenseList';
import SettingsPage from './components/SettingsPage';
import UrlModal from './components/modals/UrlModal';
import CategoryModal from './components/modals/CategoryModal';
import RecurringModal from './components/modals/RecurringModal';
import AddTransactionModal from './components/modals/AddTransactionModal';
import EditTransactionModal from './components/modals/EditTransactionModal';
import appBackground from './assets/background.png';
import { INITIAL_CATEGORIES, CATEGORY_FILTER_ALL, FALLBACK_CATEGORY_COLOR } from './utils/constants.js';
import { ensureValidCategories, isValidUrl, normalizePaymentMethod, sanitizeRecurring, sanitizeText, sanitizeTransaction, validateRecurringForm, validateTransactionForm } from './utils/validation.js';
import { safeGetItem, safeSetItem } from './utils/storage.js';
import { fetchJson, postToGAS, buildGasUrl } from './utils/gasApi.js';

// 尚未設定同步網址時的提示訊息（依操作類型區分，集中管理避免字面量重複）
const NO_GAS_URL_MESSAGES = {
  transactionAdd: '尚未設定 GAS URL！此記錄只會暫存於畫面，重新整理後將消失。請由右上角「⋯」選單設定同步網址。',
  transactionUpdate: '尚未設定 GAS URL！此修改只會暫存於畫面，重新整理後將消失。請由右上角「⋯」選單設定同步網址。',
  recurringAdd: '尚未設定 GAS URL！此恆常開支只會暫存於畫面，重新整理後將消失。請由右上角「⋯」選單設定同步網址。',
  recurringUpdate: '尚未設定 GAS URL！此修改只會暫存於畫面，重新整理後將消失。請由右上角「⋯」選單設定同步網址。',
  recategorize: '尚未設定 GAS URL！類別重新歸類只會暫存於畫面，重新整理後將還原。'
};

// 依狀態訊息類型回傳對應的樣式類別
const statusClass = (type) =>
  type === 'error'
    ? 'bg-red-50 border-danger text-danger'
    : type === 'success'
      ? 'bg-green-50 border-success text-success'
      : 'bg-surface-warm border-ink text-ink-soft';

export default function App() {
  // --- Global States ---
  const [activeTab, setActiveTab] = useState('overview');
  // 以 safeGetItem 包裝，儲存空間被封鎖時不再於啟動時當機
  const [gasUrl, setGasUrl] = useState(() => safeGetItem('gas_app_url', ''));
  // 選用的 API Token（配合 GAS 端 GAS_API_TOKEN Script Property），端點授權用；未設定即公開
  const [gasApiToken, setGasApiToken] = useState(() => safeGetItem('gas_api_token', ''));
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const [transactions, setTransactions] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [categories, setCategories] = useState(() => {
    try {
      // 以 safeGetItem 包裝，儲存空間被封鎖時回傳 fallback
      const saved = safeGetItem('app_categories', '');
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
  const [editingRecurring, setEditingRecurring] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // --- Filter States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(CATEGORY_FILTER_ALL);

  // 恆常開支列表專用的篩選／搜尋狀態，與交易明細的篩選各自獨立
  const [recurringSearchQuery, setRecurringSearchQuery] = useState('');
  const [recurringSelectedCategoryFilter, setRecurringSelectedCategoryFilter] = useState(CATEGORY_FILTER_ALL);

  // 請求序號與 AbortController，用於丟棄過期回應、取消過時的載入請求（race condition 防護）
  const loadRequestIdRef = useRef(0);
  const loadAbortRef = useRef(null);

  // 防止 React StrictMode（開發模式）重複觸發初始載入
  const hasInitialLoadRef = useRef(false);
  // 狀態訊息自動隱藏計時器
  const statusTimeoutRef = useRef(null);

  // 統一管理狀態訊息——顯示新訊息前先清除舊計時器，
  // 避免較早的 setTimeout 把較新的訊息清掉；autoHideMs > 0 時才自動隱藏
  const showStatus = (type, text, autoHideMs = 0) => {
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = null;
    }
    setStatusMsg({ type, text });
    if (autoHideMs > 0) {
      statusTimeoutRef.current = setTimeout(() => {
        statusTimeoutRef.current = null;
        setStatusMsg({ type: '', text: '' });
      }, autoHideMs);
    }
  };

  // 尚未設定同步網址時的統一警告（訊息內容集中在模組頂層的 NO_GAS_URL_MESSAGES）
  const warnNoGasUrl = (key) => showStatus('error', NO_GAS_URL_MESSAGES[key]);

  // --- 月份導覽（HeaderBar 與趨勢圖共用，避免重複的內聯箭頭函式） ---
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(year => year - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(month => month - 1);
    }
  };
  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(year => year + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(month => month + 1);
    }
  };
  const handleSelectMonth = (year, month) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  useEffect(() => {
    // 以 safeSetItem 包裝，儲存空間被封鎖時不再於 effect 內拋錯當機
    if (!safeSetItem('app_categories', JSON.stringify(categories))) {
      console.warn('無法寫入 localStorage（app_categories），類別設定可能不會被保存');
    }
  }, [categories]);

  useEffect(() => {
    // StrictMode 下初始 effect 會被執行兩次，以 ref 確保只載入一次
    if (hasInitialLoadRef.current) return;
    hasInitialLoadRef.current = true;
    if (gasUrl) {
      loadDataFromGAS(gasUrl);
    }
  }, []);

  // 元件卸載時清理計時器
  useEffect(() => () => {
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }
  }, []);

  // --- API 請求與數據處理 ---
  const loadDataFromGAS = async (url = gasUrl, token = gasApiToken) => {
    if (!url) {
      setShowUrlModal(true);
      return;
    }

    // 取消前一筆仍在進行的載入並遞增請求序號，較舊的回應會直接被丟棄，
    // 避免過期資料覆蓋較新的狀態（race condition 防護）
    if (loadAbortRef.current) {
      loadAbortRef.current.abort();
    }
    const controller = new AbortController();
    loadAbortRef.current = controller;
    const requestId = ++loadRequestIdRef.current;

    setLoading(true);
    showStatus('info', '正在連線至 Google Sheets 讀取數據...');
    try {
      // 改用 fetchJson 統一檢查 HTTP 狀態碼並確保回應為 JSON
      const json = await fetchJson(buildGasUrl(url, token), { signal: controller.signal });

      // 若期間已有較新的請求或樂觀更新，丟棄此過期回應
      if (requestId !== loadRequestIdRef.current) return;

      if (json.status === 'success') {
        // 正確解構 GAS 回傳的 data 物件，確保必定為陣列
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

        // 清洗 GAS 回傳資料，確保欄位安全
        setTransactions(fetchedTransactions.map(sanitizeTransaction).filter(Boolean));
        setRecurringExpenses(fetchedRecurring.map(sanitizeRecurring).filter(Boolean));

        showStatus('success', '數據同步成功！', 3000);
      } else {
        throw new Error(json.message || '無法取得數據');
      }
    } catch (err) {
      // 此請求已被較新的請求取代（abort），不需任何處理
      if (err?.name === 'AbortError') return;
      console.error(err);
      showStatus('error', '同步失敗: ' + (err?.message || '未知錯誤'));
      // 同步失敗時保留畫面上現有的數據（不再清空），
      // 避免暫時性網路錯誤讓使用者以為所有資料都消失了
    } finally {
      // 只有「最新」的請求可以關閉 loading，避免舊請求提前關閉新請求的載入狀態
      if (requestId === loadRequestIdRef.current) {
        loadAbortRef.current = null;
        setLoading(false);
      }
    }
  };

  const handleSaveUrl = (url, token = '') => {
    const normalizedUrl = sanitizeText(url);
    if (!normalizedUrl) {
      showStatus('error', '請先輸入 GAS URL');
      return;
    }
    if (!isValidUrl(normalizedUrl)) {
      // 財務資料端點一律要求 https，避免資料以明文傳輸
      showStatus('error', '請輸入有效的網址（需以 https:// 開頭）');
      return;
    }

    const normalizedToken = sanitizeText(token);
    setGasUrl(normalizedUrl);
    setGasApiToken(normalizedToken);
    // 以 safeSetItem 包裝，儲存空間被封鎖時不再拋錯
    if (!safeSetItem('gas_app_url', normalizedUrl)) {
      console.warn('無法寫入 localStorage（gas_app_url），網址將不會在下次開啟時保留');
    }
    if (!safeSetItem('gas_api_token', normalizedToken)) {
      console.warn('無法寫入 localStorage（gas_api_token），Token 將不會在下次開啟時保留');
    }
    setShowUrlModal(false);
    loadDataFromGAS(normalizedUrl, normalizedToken);
  };

  // 更新失敗時還原單筆交易（previous 為修改前的原資料；找不到原資料時則移除該列）
  const rollbackTransactionUpdate = (id, previous) => {
    setTransactions(prev => {
      if (!Array.isArray(prev)) return [];
      if (!previous) return prev.filter(t => t?.id !== id);
      return prev.map(t => (t?.id === id ? previous : t));
    });
  };

  // 更新失敗時還原單筆恆常開支（previous 為修改前的原資料；找不到原資料時保留現列）
  const rollbackRecurringUpdate = (id, previous) => {
    setRecurringExpenses(prev => (Array.isArray(prev) ? prev : []).map(r => (r?.id === id ? (previous || r) : r)));
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

    // 使任何進行中的載入回應失效，避免舊資料覆蓋接下來的樂觀更新
    loadRequestIdRef.current += 1;

    const tempId = 'temp_' + Date.now();
    setTransactions(prev => [{ ...payload, id: tempId }, ...(Array.isArray(prev) ? prev : [])]);
    setShowAddModal(false);

    // 尚未設定同步網址時明確警告，避免使用者以為資料已保存
    if (!gasUrl) {
      warnNoGasUrl('transactionAdd');
      return;
    }

    setLoading(true);
    try {
      const resJson = await postToGAS(gasUrl, payload, gasApiToken);
      if (resJson.status === 'success') await loadDataFromGAS();
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

    // 先記住原資料，更新失敗時用於回滾，避免畫面與伺服器資料不同步
    const previous = (Array.isArray(transactions) ? transactions : []).find(t => t?.id === payload.id);

    // 使任何進行中的載入回應失效，避免舊資料覆蓋接下來的樂觀更新
    loadRequestIdRef.current += 1;

    setTransactions(prev => (Array.isArray(prev) ? prev : []).map(t => t.id === payload.id ? payload : t));
    setEditingTransaction(null);

    // 尚未設定同步網址時明確警告，避免使用者以為修改已保存
    if (!gasUrl) {
      warnNoGasUrl('transactionUpdate');
      return;
    }

    setLoading(true);
    try {
      const resJson = await postToGAS(gasUrl, payload, gasApiToken);
      if (resJson.status === 'success') await loadDataFromGAS();
      else {
        alert('更新失敗：' + resJson.message);
        // 回滾樂觀更新，還原為修改前的資料
        rollbackTransactionUpdate(payload.id, previous);
      }
    } catch (err) {
      alert('更新請求失敗：' + err.message);
      // 回滾樂觀更新，還原為修改前的資料
      rollbackTransactionUpdate(payload.id, previous);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('確定要刪除這筆支出紀錄嗎？')) return;

    // 使任何進行中的載入回應失效，避免舊資料覆蓋接下來的樂觀更新
    loadRequestIdRef.current += 1;

    setTransactions(prev => (Array.isArray(prev) ? prev : []).filter(t => t.id !== id));
    if (gasUrl) {
      setLoading(true);
      try {
        const resJson = await postToGAS(gasUrl, { action: 'deleteTransaction', id: id }, gasApiToken);
        if (resJson.status !== 'success') { alert('刪除失敗：' + resJson.message); await loadDataFromGAS(); }
      } catch (err) {
        alert('刪除請求失敗：' + err.message); await loadDataFromGAS();
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

    // 使任何進行中的載入回應失效，避免舊資料覆蓋接下來的樂觀更新
    loadRequestIdRef.current += 1;

    const tempId = 'rec_' + Date.now();
    setRecurringExpenses(prev => [...(Array.isArray(prev) ? prev : []), { ...payload, id: tempId }]);

    // 尚未設定同步網址時明確警告，避免使用者以為資料已保存
    if (!gasUrl) {
      warnNoGasUrl('recurringAdd');
      return;
    }

    setLoading(true);
    try {
      const resJson = await postToGAS(gasUrl, payload, gasApiToken);
      if (resJson.status === 'success') await loadDataFromGAS();
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
  };

  const handleDeleteRecurring = async (id) => {
    if (!window.confirm('確定要刪除這筆恆常開支嗎？')) return;

    // 使任何進行中的載入回應失效，避免舊資料覆蓋接下來的樂觀更新
    loadRequestIdRef.current += 1;

    setRecurringExpenses(prev => (Array.isArray(prev) ? prev : []).filter(r => r.id !== id));
    if (gasUrl) {
      setLoading(true);
      try {
        const resJson = await postToGAS(gasUrl, { action: 'deleteRecurring', id: id }, gasApiToken);
        if (resJson.status !== 'success') { alert('刪除失敗：' + resJson.message); await loadDataFromGAS(); }
      } catch (err) {
        alert('刪除請求失敗：' + err.message); await loadDataFromGAS();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateRecurring = async (formData) => {
    const validationError = validateRecurringForm(formData);
    if (validationError) {
      alert(validationError);
      return;
    }

    if (!formData?.id) {
      alert('無法更新：缺少恆常開支 ID');
      return;
    }

    const dayOfMonth = parseInt(formData.dayOfMonth, 10);
    const safeDayOfMonth = Number.isNaN(dayOfMonth) ? 1 : dayOfMonth;
    const payload = {
      action: 'editRecurring',
      ...formData,
      title: sanitizeText(formData.title),
      paymentMethod: normalizePaymentMethod(formData),
      amount: Number(formData.amount),
      dayOfMonth: safeDayOfMonth
    };

    // 先記住原資料，更新失敗時用於回滾
    const previous = (Array.isArray(recurringExpenses) ? recurringExpenses : []).find(r => r?.id === payload.id);

    // 使任何進行中的載入回應失效，避免舊資料覆蓋接下來的樂觀更新
    loadRequestIdRef.current += 1;

    setRecurringExpenses(prev => (Array.isArray(prev) ? prev : []).map(r => r.id === payload.id ? payload : r));
    setEditingRecurring(null);

    // 尚未設定同步網址時明確警告，避免使用者以為修改已保存
    if (!gasUrl) {
      warnNoGasUrl('recurringUpdate');
      return;
    }

    setLoading(true);
    try {
      const resJson = await postToGAS(gasUrl, payload, gasApiToken);
      if (resJson.status === 'success') await loadDataFromGAS();
      else {
        alert('更新失敗：' + resJson.message);
        // 回滾樂觀更新，還原為修改前的資料
        rollbackRecurringUpdate(payload.id, previous);
      }
    } catch (err) {
      alert('更新請求失敗：' + err.message);
      // 回滾樂觀更新，還原為修改前的資料
      rollbackRecurringUpdate(payload.id, previous);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = (newCat) => setCategories(prev => [...prev, newCat]);

  const handleDeleteCategory = async (catId) => {
    if (categories.length <= 1) return alert('最少需保留一個類別！');
    const catToDelete = categories.find(c => c.id === catId);
    if (!catToDelete) return;

    const remainingCategories = categories.filter(c => c.id !== catId);
    // 歸入目標：優先使用名為「其他」的剩餘類別；若刪除的正是「其他」，退回第一個剩餘類別
    const fallbackName = remainingCategories.find(c => c.name === '其他')?.name || remainingCategories[0]?.name || '其他';

    // 檢查是否有資料引用此類別
    const affectedTransactions = (Array.isArray(transactions) ? transactions : []).filter(t => t?.category === catToDelete.name);
    const affectedRecurring = (Array.isArray(recurringExpenses) ? recurringExpenses : []).filter(r => r?.category === catToDelete.name);
    const affectedCount = affectedTransactions.length + affectedRecurring.length;
    if (affectedTransactions.length > 0) {
      const confirmed = window.confirm(`此類別「${catToDelete.name}」有 ${affectedTransactions.length} 筆交易紀錄，刪除後將歸入「${fallbackName}」類別。確定要刪除嗎？`);
      if (!confirmed) return;
    }

    setCategories(remainingCategories);

    if (affectedCount === 0) return;

    // 確實將引用此類別的交易／恆常開支歸入目標類別，
    // 使「開支類別比例」與明細篩選一致（原本只刪類別、未改資料，兩邊數字會對不上）
    // （先使進行中的載入回應失效，避免舊資料蓋掉重新歸類結果）
    loadRequestIdRef.current += 1;

    setTransactions(prev => (Array.isArray(prev) ? prev : []).map(t => t?.category === catToDelete.name ? { ...t, category: fallbackName } : t));
    setRecurringExpenses(prev => (Array.isArray(prev) ? prev : []).map(r => r?.category === catToDelete.name ? { ...r, category: fallbackName } : r));

    if (!gasUrl) {
      warnNoGasUrl('recategorize');
      return;
    }

    // 將類別變更逐筆同步回試算表，避免下次同步時被還原
    setLoading(true);
    try {
      const transactionResults = affectedTransactions.map(t =>
        postToGAS(gasUrl, { action: 'editTransaction', ...t, category: fallbackName }, gasApiToken)
      );
      const recurringResults = affectedRecurring.map(r =>
        postToGAS(gasUrl, { action: 'editRecurring', ...r, category: fallbackName }, gasApiToken)
      );
      const results = await Promise.allSettled([...transactionResults, ...recurringResults]);
      const failedCount = results.filter(r => r.status === 'rejected' || r.value?.status !== 'success').length;
      await loadDataFromGAS();
      if (failedCount > 0) {
        showStatus('error', `類別刪除完成，但有 ${failedCount} 筆紀錄的新類別未能同步至試算表，下次同步時可能還原。`);
      }
    } catch (err) {
      // Promise.allSettled 與 loadDataFromGAS 正常都不會拋錯，此 catch 僅防禦性保留
      console.error(err);
      await loadDataFromGAS();
    } finally {
      setLoading(false);
    }
  };

  // --- 安全資料計算 ---
  const formattedMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  const currentMonthTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    return transactions.filter(t => {
      if (!t || !t.date) return false;
      // 安全解析日期（支援 ISO 字串與 yyyy-MM-dd）
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
          color: FALLBACK_CATEGORY_COLOR,
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
      const matchCategory = selectedCategoryFilter === CATEGORY_FILTER_ALL || t.category === selectedCategoryFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        (t.title && String(t.title).toLowerCase().includes(q)) ||
        (t.payer && String(t.payer).toLowerCase().includes(q)) ||
        (t.paymentMethod && String(t.paymentMethod).toLowerCase().includes(q)) ||
        (t.note && String(t.note).toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [currentMonthTransactions, selectedCategoryFilter, searchQuery]);

  const filteredRecurringExpenses = useMemo(() => {
    if (!Array.isArray(recurringExpenses)) return [];
    return recurringExpenses.filter(r => {
      if (!r) return false;
      const matchCategory = recurringSelectedCategoryFilter === CATEGORY_FILTER_ALL || r.category === recurringSelectedCategoryFilter;
      const q = recurringSearchQuery.toLowerCase();
      const matchSearch = !q ||
        (r.title && String(r.title).toLowerCase().includes(q)) ||
        (r.payer && String(r.payer).toLowerCase().includes(q)) ||
        (r.paymentMethod && String(r.paymentMethod).toLowerCase().includes(q)) ||
        (r.note && String(r.note).toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [recurringExpenses, recurringSelectedCategoryFilter, recurringSearchQuery]);

  // --- Render ---
  return (
    <div
      className="min-h-screen relative bg-canvas text-ink overview-font p-3 sm:p-6 md:p-8 pb-28 overflow-x-hidden"
      style={{
        backgroundImage: `url(${appBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >

      <div className="max-w-6xl mx-auto space-y-6 relative">

        {/* Header 組件 */}
        <HeaderBar
          currentYear={currentYear}
          currentMonth={currentMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onSelectDate={handleSelectMonth}
        />

        {/* 系統狀態提示 */}
        {statusMsg.text && (
          <div role="status" className={`pixel-card p-3 text-sm flex items-center gap-2 ${statusClass(statusMsg.type)}`}>
            <Clock className={`w-4 h-4 ${statusMsg.type === 'info' ? 'animate-spin' : ''}`} />
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* --- 分頁 1: 總覽 --- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" onClick={() => setShowAddModal(true)} className="pixel-button-primary group flex w-full items-center justify-center space-x-2 px-6 py-3.5 text-base">
                <Plus className="w-5 h-5" /><span>新增記帳</span>
              </button>
              <button type="button" onClick={() => setShowRecurringModal(true)} className="pixel-button-accent flex w-full items-center justify-center space-x-2 px-6 py-3.5 text-base">
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
              onMonthSelect={handleSelectMonth}
            />
          </div>
        )}

        {/* --- 分頁 2: 支帳明細 --- */}
        {activeTab === 'transactions' && (
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
        )}

        {/* --- 分頁 3: 恆常開支列表 --- */}
        {activeTab === 'recurring' && (
          <RecurringExpenseList
            recurringExpenses={filteredRecurringExpenses}
            categories={categories}
            selectedCategoryFilter={recurringSelectedCategoryFilter}
            onCategoryFilterChange={setRecurringSelectedCategoryFilter}
            searchQuery={recurringSearchQuery}
            onSearchChange={setRecurringSearchQuery}
            onEdit={setEditingRecurring}
            onDelete={handleDeleteRecurring}
            onAdd={() => setShowRecurringModal(true)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            gasUrl={gasUrl}
            hasToken={!!gasApiToken}
            loading={loading}
            onRefresh={() => loadDataFromGAS()}
            onOpenUrlModal={() => setShowUrlModal(true)}
            onOpenCategoryModal={() => setShowCategoryModal(true)}
          />
        )}

      </div>

      {/* Floating Bottom Navigation */}
      <nav aria-label="主要導覽" className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 pixel-card p-1.5 flex items-center gap-1 z-40">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-primary text-white shadow-pixel-sm'
              : 'text-ink-soft hover:text-ink hover:bg-surface-warm'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span className="hidden sm:inline">總覽</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
            activeTab === 'transactions'
              ? 'bg-accent text-ink shadow-pixel-sm'
              : 'text-ink-soft hover:text-ink hover:bg-surface-warm'
          }`}
        >
          <List className="w-5 h-5" />
          <span className="hidden sm:inline">支帳明細</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('recurring')}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
            activeTab === 'recurring'
              ? 'bg-accent text-ink shadow-pixel-sm'
              : 'text-ink-soft hover:text-ink hover:bg-surface-warm'
          }`}
        >
          <RefreshCw className="w-5 h-5" />
          <span className="hidden sm:inline">恆常開支</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
            activeTab === 'settings'
              ? 'bg-[var(--color-secondary-dark)] text-white shadow-pixel-sm'
              : 'text-ink-soft hover:text-ink hover:bg-surface-warm'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="hidden sm:inline">設定</span>
        </button>
      </nav>

      {/* --- Modals --- */}
      {showUrlModal && <UrlModal initialUrl={gasUrl} initialToken={gasApiToken} onClose={() => setShowUrlModal(false)} onSave={handleSaveUrl} />}
      {showCategoryModal && <CategoryModal categories={categories} onClose={() => setShowCategoryModal(false)} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} />}
      {showRecurringModal && <RecurringModal categories={categories} onClose={() => setShowRecurringModal(false)} onAdd={handleAddRecurring} loading={loading} />}
      {editingRecurring && <RecurringModal categories={categories} initialRecurring={editingRecurring} onClose={() => setEditingRecurring(null)} onUpdate={handleUpdateRecurring} loading={loading} />}
      {showAddModal && <AddTransactionModal categories={categories} onClose={() => setShowAddModal(false)} onSubmit={handleAddTransaction} loading={loading} />}
      {editingTransaction && <EditTransactionModal transaction={editingTransaction} categories={categories} onClose={() => setEditingTransaction(null)} onSubmit={handleUpdateTransaction} loading={loading} />}

    </div>
  );
}

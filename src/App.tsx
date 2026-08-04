import React, { useState, useMemo } from 'react';

interface Transaction {
  id: number | string;
  date: string;
  amount: number;
  category: string;
  title: string;
  payer: string;
  paymentMethod: string;
  note: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

const INITIAL_CATEGORIES: Category[] = [
  { id: 'food', name: '餐飲飲食', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { id: 'transport', name: '交通出行', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { id: 'housing', name: '日常居住', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { id: 'entertainment', name: '休閒娛樂', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { id: 'shopping', name: '購物消費', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  { id: 'medical', name: '醫療保健', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  { id: 'other', name: '其他雜項', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    date: new Date().toISOString().split('T')[0],
    amount: 120,
    category: 'food',
    title: '午餐套餐',
    payer: '我',
    paymentMethod: '信用卡',
    note: '美味便當',
  }
];

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
  </svg>
);

const CloudIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
  </svg>
);

const RefreshIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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

export default function App() {
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  const [gasApiUrl, setGasApiUrl] = useState(() => localStorage.getItem('gas_api_url') || '');
  const [inputApiUrl, setInputApiUrl] = useState(gasApiUrl);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTxId, setEditingTxId] = useState<number | string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    date: todayStr,
    amount: '',
    category: 'food',
    title: '',
    payer: '我',
    paymentMethod: '信用卡',
    note: ''
  });

  const handleFetchFromCloud = async () => {
    if (!gasApiUrl) {
      setIsApiModalOpen(true);
      return;
    }

    setIsSyncing(true);
    setSyncStatus('idle');
    setSyncMessage('正在從 Google Sheets 載入資料...');

    try {
      const response = await fetch(`${gasApiUrl}?action=getTransactions`);
      const result = await response.json();

      if (result.status === 'success' && Array.isArray(result.data)) {
        const cloudData: Transaction[] = result.data.map((item: any) => ({
          id: item.id || Date.now(),
          date: item.date ? String(item.date).split('T')[0] : todayStr,
          amount: Number(item.amount) || 0,
          category: item.category || 'other',
          title: item.title || '',
          payer: item.payer || '我',
          paymentMethod: item.paymentMethod || '信用卡',
          note: item.note || ''
        }));

        setTransactions(cloudData);
        setSyncStatus('success');
        setSyncMessage(`同步成功！已載入 ${cloudData.length} 筆雲端紀錄`);
      } else {
        throw new Error(result.message || '無法讀取數據');
      }
    } catch (err: any) {
      const errorMessage = err.message || '請確認 API URL 是否正確並已公開部署';
      setSyncStatus('error');
      setSyncMessage(`同步失敗: ${errorMessage}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncToCloud = async (newRecord: Transaction) => {
    if (!gasApiUrl) return;

    setIsSyncing(true);
    setSyncMessage('正在同步紀錄至 Google Sheets...');

    try {
      const response = await fetch(gasApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'addTransaction',
          payload: newRecord
        })
      });
      const result = await response.json();

      if (result.status === 'success') {
        setSyncStatus('success');
        setSyncMessage('已成功即時同步寫入 Google Sheets！');
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      const errorMessage = err.message || '連線失敗';
      setSyncStatus('error');
      setSyncMessage(`雲端寫入失敗: ${errorMessage}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = inputApiUrl.trim();
    setGasApiUrl(cleanUrl);
    localStorage.setItem('gas_api_url', cleanUrl);
    setSyncStatus('success');
    setSyncMessage('API Web App URL 已成功儲存！');
    setIsApiModalOpen(false);
  };

  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) return;

    const catObj = categories.find(c => c.id === formData.category);
    const defaultTitle = catObj ? catObj.name : '記帳';

    if (editingTxId) {
      setTransactions(transactions.map(t => t.id === editingTxId ? {
        ...t,
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date,
        title: formData.title || defaultTitle,
        payer: formData.payer,
        paymentMethod: formData.paymentMethod,
        note: formData.note
      } : t));
    } else {
      const newTx: Transaction = {
        id: Date.now(),
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date,
        title: formData.title || defaultTitle,
        payer: formData.payer,
        paymentMethod: formData.paymentMethod,
        note: formData.note
      };
      setTransactions([newTx, ...transactions]);

      if (gasApiUrl) {
        handleSyncToCloud(newTx);
      }
    }

    setIsModalOpen(false);
    setEditingTxId(null);
    setFormData({
      date: todayStr,
      amount: '',
      category: 'food',
      title: '',
      payer: '我',
      paymentMethod: '信用卡',
      note: ''
    });
  };

  const handleDeleteTransaction = (id: number | string) => {
    if (window.confirm('確定要刪除這筆紀錄嗎？')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTxId(tx.id);
    setFormData({
      date: tx.date,
      amount: String(tx.amount),
      category: tx.category,
      title: tx.title,
      payer: tx.payer,
      paymentMethod: tx.paymentMethod,
      note: tx.note
    });
    setIsModalOpen(true);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchMonth = t.date.startsWith(selectedMonth);
      const matchCategory = selectedCategoryFilter === 'all' || t.category === selectedCategoryFilter;
      const matchQuery = !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.note.toLowerCase().includes(searchQuery.toLowerCase());
      return matchMonth && matchCategory && matchQuery;
    });
  }, [transactions, selectedMonth, selectedCategoryFilter, searchQuery]);

  const totalMonthlyAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [filteredTransactions]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        <header className="relative bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsApiModalOpen(true)}
              className={`p-2 border rounded-xl transition-all cursor-pointer ${
                gasApiUrl
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
              }`}
              title={gasApiUrl ? "雲端已連線" : "未連線雲端 (點擊設定)"}
            >
              <CloudIcon />
            </button>

            <button
              onClick={handleFetchFromCloud}
              disabled={isSyncing}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="從雲端重新整理"
            >
              <RefreshIcon className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <div>
              <h1 className="text-xl font-black text-white bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                私人記帳本
              </h1>
              <p className="text-xs text-slate-400">極簡個人財務統計</p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingTxId(null);
              setFormData({
                date: todayStr,
                amount: '',
                category: 'food',
                title: '',
                payer: '我',
                paymentMethod: '信用卡',
                note: ''
              });
              setIsModalOpen(true);
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <PlusIcon />
            <span>新增記帳</span>
          </button>
        </header>

        {syncMessage && (
          <div className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
            syncStatus === 'error'
              ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
          }`}>
            <div className="flex items-center gap-2">
              {isSyncing && <RefreshIcon className="w-4 h-4 animate-spin text-emerald-400" />}
              <span>{syncMessage}</span>
            </div>
            <button onClick={() => setSyncMessage('')} className="text-slate-400 hover:text-white font-bold">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div className="text-xs text-slate-400 font-medium">選擇月份</div>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-2 bg-slate-950 border border-slate-800 text-emerald-400 font-bold text-sm rounded-xl p-2 focus:outline-none"
            />
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div className="text-xs text-slate-400 font-medium">本月總開支</div>
            <div className="text-2xl font-black text-rose-400 mt-1">
              ${totalMonthlyAmount.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="搜尋名稱或備註..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500/50"
          />
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">所有類別</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-300 mb-2">開支明細</h2>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              尚無相關記帳紀錄
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((tx) => {
                const cat = categories.find(c => c.id === tx.category) || categories[categories.length - 1];
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${cat.color}`}>
                          {cat.name}
                        </span>
                        <span className="text-sm font-bold text-white">{tx.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex gap-2">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span>{tx.paymentMethod}</span>
                        {tx.note && <><span>•</span><span>{tx.note}</span></>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-sm font-black text-rose-400">
                        ${Number(tx.amount).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditTransaction(tx)}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">
                  {editingTxId ? '編輯記帳' : '新增記帳'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
              </div>

              <form onSubmit={handleSubmitTransaction} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">日期</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">金額 ($)</label>
                    <input
                      type="number"
                      required
                      placeholder="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">類別</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">項目名稱</label>
                  <input
                    type="text"
                    placeholder="如：午餐、搭計程車"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">付款人</label>
                    <select
                      value={formData.payer}
                      onChange={(e) => setFormData({ ...formData, payer: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none"
                    >
                      <option value="我">我</option>
                      <option value="伴侶">伴侶</option>
                      <option value="共同">共同</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">支付方式</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none"
                    >
                      <option value="信用卡">信用卡</option>
                      <option value="現金">現金</option>
                      <option value="行動支付">行動支付</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">備註 (選填)</label>
                  <input
                    type="text"
                    placeholder="備註資訊..."
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    儲存
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isApiModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CloudIcon />
                  <span>Google Sheets 雲端 API 設定</span>
                </h3>
                <button onClick={() => setIsApiModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
              </div>

              <form onSubmit={handleSaveApiUrl} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Web App URL (網頁應用程式網址)</label>
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    required
                    value={inputApiUrl}
                    onChange={(e) => setInputApiUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsApiModalOpen(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    儲存 API 網址
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

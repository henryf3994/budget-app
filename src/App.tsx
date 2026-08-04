// ... existing code ...
const LargeChevronRightIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
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

function MiniCalendarPicker({ value, onChange }: { value: string; onChange: (d: string) => void }) {
// ... existing code ...
export default function App() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [categoryPresets, setCategoryPresets] = useState<Record<string, string[]>>(INITIAL_CATEGORY_PRESETS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [recurringRules, setRecurringRules] = useState(INITIAL_RECURRING_RULES);
  const [selectedMonth, setSelectedMonth] = useState('2026-07');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Cloud API Sync State
  const [gasApiUrl, setGasApiUrl] = useState(() => localStorage.getItem('gas_api_url') || '');
  const [inputApiUrl, setInputApiUrl] = useState(gasApiUrl);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
// ... existing code ...
  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${yyyy}-${mm}`);
  };

  // 從 Google Sheets (GAS API) 讀取最新明細紀錄
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
        // 將 GAS 傳回的資料映射為前端 React 的交易格式
        const cloudData = result.data.map((item: any) => ({
          id: item.id || Date.now(),
          date: item.date ? String(item.date).split('T')[0] : new Date().toISOString().split('T')[0],
          amount: Number(item.amount) || 0,
          category: item.category || 'other',
          title: item.title || '',
          payer: item.payer || 'YSK',
          paymentMethod: item.paymentMethod || '信用卡',
          note: item.note || '',
          isRecurring: Boolean(item.isRecurring),
          frequency: item.frequency || 'monthly'
        }));

        if (cloudData.length > 0) {
          setTransactions(cloudData);
          setSyncStatus('success');
          setSyncMessage(`同步成功！已載入 ${cloudData.length} 筆雲端紀錄`);
        } else {
          setSyncStatus('success');
          setSyncMessage('Google Sheets 數據庫目前尚無紀錄');
        }
      } else {
        throw new Error(result.message || '無法讀取數據');
      }
    } catch (err: any) {
      console.error('Fetch cloud data error:', err);
      setSyncStatus('error');
      setSyncMessage(`同步失敗: ${err.message || '請確認 API URL 是否正確並已公開部署'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // 將新紀錄即時 POST 到 Google Sheets
  const handleSyncToCloud = async (newRecord: any) => {
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
      console.error('Sync to cloud error:', err);
      setSyncStatus('error');
      setSyncMessage(`雲端寫入失敗: ${err.message || '連線失敗'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // 儲存 Google Apps Script Web App URL
  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = inputApiUrl.trim();
    setGasApiUrl(cleanUrl);
    localStorage.setItem('gas_api_url', cleanUrl);
    setSyncStatus('success');
    setSyncMessage('API Web App URL 已成功儲存！');
    setIsApiModalOpen(false);
  };

  // Import CSV Function
// ... existing code ...
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) return;

    const defaultTitle = categories.find(c => c.id === formData.category)?.name;

    if (editingTxId) {
      setTransactions(transactions.map(t => t.id === editingTxId ? {
        ...t,
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date,
        title: formData.title || defaultTitle,
        payer: formData.payer,
        paymentMethod: formData.paymentMethod,
        note: formData.note,
        isRecurring: formData.isRecurring,
        frequency: formData.frequency
      } : t));
    } else {
      const newTx = {
        id: Date.now(),
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
      setTransactions([newTx, ...transactions]);

      // 若已設定 GAS API URL，自動同步發送至雲端 Google Sheets
      if (gasApiUrl) {
        handleSyncToCloud(newTx);
      }
    }

    setIsModalOpen(false);
    setEditingTxId(null);
  };
// ... existing code ...
        {/* Top Header Navigation */}
        <header className="relative bg-slate-900/60 px-4 py-5 md:px-6 md:py-6 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            
            {/* 左側功能區：雲端串接 / 匯入 / 匯出按鈕 ＋ App 名稱 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800">
                
                {/* 雲端 API 設定按鈕 */}
                <button
                  onClick={() => setIsApiModalOpen(true)}
                  className={`p-2 border rounded-xl transition-all active:scale-95 cursor-pointer shadow-md flex items-center justify-center shrink-0 ${
                    gasApiUrl 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 animate-pulse'
                  }`}
                  title={gasApiUrl ? "雲端資料庫已連線 (點擊設定)" : "未設定 Google Sheets API (點擊設定)"}
                >
                  <CloudIcon />
                </button>

                {/* 從雲端重新載入資料按鈕 */}
                <button
                  onClick={handleFetchFromCloud}
                  disabled={isSyncing}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700/80 rounded-xl transition-all active:scale-95 cursor-pointer shadow-md flex items-center justify-center shrink-0 disabled:opacity-50"
                  title="從 Google Sheets 重新載入數據"
                >
                  <RefreshIcon className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
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
                  <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full border font-medium hidden sm:inline ${
                    gasApiUrl 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {gasApiUrl ? 'Cloud DB Connected' : 'Local Mode'}
                  </span>
                </h1>
                <p className="text-[11px] md:text-xs text-slate-400 mt-0.5 hidden xs:block">獨立個人財務追蹤 • 每月開支統計</p>
              </div>
            </div>

            {/* 右側：管理類別按鈕 */}
// ... existing code ...
        {/* Sync Status Banner */}
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
            <button onClick={() => setSyncMessage('')} className="text-slate-400 hover:text-white font-bold ml-2">✕</button>
          </div>
        )}

        {/* Top Summary Cards */}
// ... existing code ...
        {/* Modal for Google Apps Script Cloud Sync API Setup */}
        {isApiModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CloudIcon />
                  <span>Google Sheets 雲端 API 串接設定</span>
                </h3>
                <button onClick={() => setIsApiModalOpen(false)} className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer">✕</button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <p className="leading-relaxed">
                  請將你在 Google Apps Script 部署完成後的 <strong>Web App URL</strong> 貼在下方：
                </p>

                <form onSubmit={handleSaveApiUrl} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Web App URL (網頁應用程式網址)</label>
                    <input
                      type="url"
                      placeholder="https://script.google.com/macros/s/.../exec"
                      required
                      value={inputApiUrl}
                      onChange={(e) => setInputApiUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1 text-[11px] text-slate-400">
                    <div className="font-semibold text-emerald-400">💡 部署設定自我檢查：</div>
                    <div>1. 部署作業類型請選擇：「網頁應用程式 (Web App)」</div>
                    <div>2. 執行身份：「我 (Me)」</div>
                    <div>3. 誰有存取權：「所有人 (Anyone)」</div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    {gasApiUrl ? (
                      <button
                        type="button"
                        onClick={handleFetchFromCloud}
                        className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <RefreshIcon className="w-3.5 h-3.5" /> 測試並載入雲端資料
                      </button>
                    ) : <span />}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsApiModalOpen(false)}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                      >
                        儲存 API 網址
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Managing Categories and Presets */}
// ... existing code ...
```

---

### 🚀 串接使用步驟指南：

1. **取得 API 網址**：
   - 開啟你已建立好的 Google Apps Script 專案（即右邊的 `Code.gs`）。
   - 點選右上角 **部署 (Deploy)** ➔ **新增部署作業 (New deployment)**。
   - 選擇 **網頁應用程式 (Web App)**：
     - **執行身份** 設為：`我 (Me)`
     - **誰有存取權** 設為：`所有人 (Anyone)`
   - 點擊「部署」並複製產生的 **Web App URL**（例如 `https://script.google.com/macros/s/.../exec`）。

2. **在記帳本輸入 URL**：
   - 在前端網頁頂端點擊 **雲端圖示 ☁️**。
   - 貼上複製的 Web App URL 並點擊 **儲存 API 網址**。

3. **雙向同步功能**：
   - **從雲端載入**：點擊頂端的 **重新整理圖示 🔄**，即可從 Google Sheets 取得所有資料。
   - **即時自動寫入**：點擊「+ 新增記賬」並儲存後，系統會自動將該筆紀錄即時追加至 Google Sheets 的 `Transactions` 工作表中！

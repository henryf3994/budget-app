# 私人記帳本 (budget-app)

家庭用記帳 PWA：前端為 React + Vite，資料存在 Google Sheets，透過 Google Apps Script（GAS）
Web App 當作 API；離線時以 localStorage 快取最近一次資料。

## 功能

- **總覽**：當月支出摘要、類別比例條、7 個月支出趨勢圖（可切換總支出／分類）
- **記帳**：新增／編輯／刪除交易，樂觀更新（先更新畫面，失敗自動回滾）
- **恆常開支**：每月固定支出清單，可新增／編輯／刪除
- **設定**：GAS API URL、API Token、類別與顏色管理（新增／刪除類別、快速標題）

## 技術棧

| 用途 | 工具                                                               |
| ---- | ------------------------------------------------------------------ |
| UI   | React 18                                                           |
| 建置 | Vite 5                                                             |
| 樣式 | Tailwind CSS 3（pixel 風格設計 token 定義於 `tailwind.config.js`） |
| 圖示 | lucide-react                                                       |
| Lint | ESLint 9（flat config）＋ eslint-plugin-react / react-hooks        |
| 格式 | Prettier 3                                                         |
| 測試 | Vitest 2                                                           |

## 開發指令

```bash
npm install
npm run dev          # 啟動開發伺服器
npm run build        # 產出 dist/
npm run preview      # 預覽 production build
npm run lint         # ESLint（目前 0 problems）
npm run lint:fix     # 自動修正可修正的問題
npm run format       # Prettier 格式化所有檔案
npm run format:check # 檢查格式（CI 用）
npm run test         # 以 Vitest 執行單元測試
npm run test:watch   # watch 模式
```

## 目錄結構

```
src/
  App.jsx                    # 應用主體：狀態、持久化、GAS 同步與各分頁 render
  main.jsx                   # 進入點
  index.css                  # Tailwind 與像素風元件樣式
  components/
    HeaderBar.jsx            # 標題列＋月份切換
    SummaryCards.jsx         # 當月支出／筆數摘要
    CategoryBreakdown.jsx    # 類別比例條（純計算見 utils/categoryMath.js）
    ExpenseTrendChart.jsx    # 7 個月趨勢折線圖（純計算見 utils/chartMath.js）
    TransactionList.jsx      # 交易明細＋搜尋／排序／類別篩選
    RecurringExpenseList.jsx # 恆常開支列表
    SettingsPage.jsx         # 設定頁
    MiniCalendar.jsx         # 日期選擇器
    modals/                  # 各對話框（新增／編輯交易、恆常開支、類別、URL）
  hooks/useOnClickOutside.js # 點擊外部關閉
  utils/                     # 純函數：驗證、篩選、格式化、GAS API、storage 等
```

## 資料與 localStorage 鍵值

鍵值集中定義於 `src/utils/constants.js` 的 `STORAGE_KEYS`：

| 鍵值                     | 內容                                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| `app_categories`         | 類別清單（名稱、顏色、快速標題）                                     |
| `app_transactions_cache` | 最近一次同步的交易快取（**僅供讀取顯示**，刪除不影響 Google Sheets） |
| `app_recurring_cache`    | 最近一次同步的恆常開支快取                                           |
| `gas_app_url`            | GAS Web App URL（必須為 https）                                      |
| `gas_api_token`          | 選用的 API Token                                                     |

> 新增／修改／刪除一律送往 GAS；localStorage 只是唯讀快取，避免同步失敗時整頁空白。
> 若瀏覽器封鎖 localStorage，`utils/storage.js` 會攔截例外，App 仍可運作（只是不留快取）。

## GAS API 契約

前端只用兩個動作：`GET` 讀取全部資料、`POST` 寫入單一異動（無批次端點）。

### GET `<GAS_URL>?token=<TOKEN>`

`token` 為選用；若 GAS Script Properties 設定了 `GAS_API_TOKEN`，則必須帶上相同值。

```json
{
  "status": "success",
  "data": {
    "transactions": [
      {
        "id": "tx_1",
        "date": "2026-08-31",
        "amount": 120.5,
        "category": "購物娛樂",
        "title": "超市買餸",
        "payer": "FMH",
        "paymentMethod": "信用卡",
        "note": ""
      }
    ],
    "recurring": [
      {
        "id": "rec_1",
        "amount": 2000,
        "category": "工人",
        "title": "月薪",
        "payer": "YSK",
        "paymentMethod": "轉賬",
        "dayOfMonth": 15,
        "frequency": "Monthly",
        "note": ""
      }
    ]
  }
}
```

前端也接受 `{ status, transactions, recurring }` 或 `{ status, data: [...] }` 等舊格式（見 `App.jsx`
的 `loadDataFromGAS`）。

### POST `<GAS_URL>`（`Content-Type: text/plain;charset=utf-8`）

請求 body 為 JSON，包含 `action`、選用的 `token` 與該筆資料欄位：

| action              | 必要欄位                                                                      | 說明                                       |
| ------------------- | ----------------------------------------------------------------------------- | ------------------------------------------ |
| `addTransaction`    | `date`（YYYY-MM-DD）、`amount`、`category`、`title`、`payer`、`paymentMethod` | 新增交易，`id` 由 GAS 產生                 |
| `editTransaction`   | `id` ＋ 上述欄位                                                              | 以 `id` 找到列並整列更新                   |
| `deleteTransaction` | `id`                                                                          | 刪除該列                                   |
| `addRecurring`      | `amount`、`category`、`title`、`payer`、`paymentMethod`、`dayOfMonth`（1–31） | 新增恆常開支（`frequency` 固定 `Monthly`） |
| `editRecurring`     | `id` ＋ 上述欄位                                                              | 更新恆常開支                               |
| `deleteRecurring`   | `id`                                                                          | 刪除恆常開支                               |

回傳格式：

```json
{ "status": "success", "message": "Transaction added" }
{ "status": "error",   "message": "未授權的請求" }
```

寫入採樂觀更新（optimistic update）：先在畫面套用變更，再送出 POST。

- **成功時不再阻塞等待重新拉取**：`addTransaction` / `addRecurring` 因 `id` 由 GAS 產生，會在寫入
  成功後安排一次**背景靜默重載**（延遲 400ms、會合併短時間內的多筆寫入）補回正式 `id`；
  `editTransaction` / `editRecurring` / `delete*` 因 `id` 已知、樂觀更新即為最終結果，成功時完全不發 GET。
- **失敗或網路錯誤時**會顯示訊息並回滾樂觀更新，必要時重新同步。

> 效能備註：原本每次寫入成功都再 `await` 一次 GET，等於每個操作連續呼叫兩次 GAS `/exec`，
> 是同步緩慢（10–20 秒）的主因。前端已改為不在寫入路徑上阻塞等待第二趟請求。
> 所有 GAS 請求預設 20 秒逾時（`utils/gasApi.js` 的 `GAS_REQUEST_TIMEOUT_MS`），逾時會中止請求並
> 顯示可讀訊息，避免 UI 一直卡在載入中。
>
> 另外，「讀取」與「寫入」的忙碌狀態是分開的：`loading` 只代表重新整理／載入試算表，
> `submitting`（`App.jsx`）才是表單送出中的狀態，且只有各 Modal 的送出鈕綁定 `submitting`。
> 若兩者共用同一個旗標，初始化或手動重新整理（可能長達 10–20 秒）期間開啟新增／編輯視窗時，
> 送出鈕會一直是 disabled、看起來像壞掉沒反應。

> **注意**：`google_apps_script`（GAS 後端，含 `doGet` / `doPost` / `processRecurringExpenses`）
> 目前被 `.gitignore` 忽略、未納入版控。Token 透過 GAS Script Properties 提供，不寫在程式碼中；
> 建議將該檔案移入 `server/` 並取消忽略，讓 API 契約與實作一起版控。

## 開發慣例

- **純函數放 `src/utils/`**：驗證、篩選、格式化、圖表數學都與 React 無關，可直接單元測試。
- **測試檔與被測模組同層**：`xxx.test.js`，使用 Vitest 的 `describe / it / expect`。
- **樣式 token 集中**：顏色、圓角、陰影定義在 `tailwind.config.js`；JS 內需要 literal 顏色時
  以 `constants.js` 或元件頂層常數集中管理（例如 `CHART_COLORS`）。
- **ESLint 目前只啟用經典 hooks 規則**（`rules-of-hooks`、`exhaustive-deps`）。
  `eslint-plugin-react-hooks` v7 的 React Compiler 規則集（`recommended-latest`）較嚴格，
  待 `App.jsx` 拆分為 hooks／selectors 後再逐步導入。
- `@types/react`、`@types/react-dom` 保留作為編輯器 IntelliSense 用；專案本身為純 JS，
  沒有 TypeScript 編譯步驟。

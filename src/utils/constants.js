// =========================================================================
// 📁 src/utils/constants.js (共用常數與共用函數)
// =========================================================================

// 未分類／找不到類別時使用的預設類別名稱（單一來源，避免字面量散落各檔案）
const DEFAULT_CATEGORY_NAME = '其他';

// localStorage 鍵值集中管理，避免同一鍵值以字面量重複出現在多處
const STORAGE_KEYS = {
  categories: 'app_categories',
  transactionsCache: 'app_transactions_cache',
  recurringCache: 'app_recurring_cache',
  gasUrl: 'gas_app_url',
  gasApiToken: 'gas_api_token'
};

// 舊版把「住屋」與「交通」合併為單一類別；此名稱供 migrateLegacyCategories
// 辨識 localStorage 內尚未拆分的舊資料（見 utils/validation.js）。
const LEGACY_HOUSING_TRANSPORT_NAME = '住屋交通';

// 由「住屋交通」拆分而成的兩個類別；獨立宣告讓 migration 能沿用同一份定義，
// 不必在 validation.js 重複字面量。
const HOUSING_CATEGORY = {
  id: 'cat_1',
  name: '住屋',
  color: '#6366f1',
  defaultTitles: ['供樓', '管理費', '水費', '電費', '煤氣費', '差餉地租', '維修', '傢俬電器']
};

const TRANSPORT_CATEGORY = {
  id: 'cat_8',
  name: '交通',
  color: '#0ea5e9',
  defaultTitles: ['停車場租', '泊車', '咪錶', '油費', '車費', '隧道費', '牌費', '驗車', '車輛維修']
};

const INITIAL_CATEGORIES = [
  HOUSING_CATEGORY,
  TRANSPORT_CATEGORY,
  {
    id: 'cat_2',
    name: '保險訂閱',
    color: '#3b82f6',
    defaultTitles: ['人壽保險', '醫療保險', 'Netflix', 'Spotify', 'iCloud', 'YouTube Premium']
  },
  {
    id: 'cat_3',
    name: '購物娛樂',
    color: '#ec4899',
    defaultTitles: ['超市買餸', '外賣飲食', '網購服飾', '電子產品', '電影日用品']
  },
  {
    id: 'cat_4',
    name: 'Riley',
    color: '#10b981',
    defaultTitles: ['奶粉', '尿片', '玩具', '補習費', '衣物', '醫療診所']
  },
  {
    id: 'cat_5',
    name: 'Bulu',
    color: '#14b8a6',
    defaultTitles: ['貓糧/狗糧', '罐頭零食', '貓砂', '獸醫診所', '寵物美容']
  },
  { id: 'cat_6', name: '工人', color: '#f59e0b', defaultTitles: ['月薪', '膳食費', '勞保', '機票', '日用品'] },
  {
    id: 'cat_7',
    name: DEFAULT_CATEGORY_NAME,
    color: '#8b5cf6',
    defaultTitles: ['雜項支出', '轉帳提款', '稅款', '人情禮物']
  }
];

const CATEGORY_FILTER_ALL = 'ALL';
const FALLBACK_CATEGORY_COLOR = INITIAL_CATEGORIES.find(c => c.name === DEFAULT_CATEGORY_NAME)?.color ?? '#8b5cf6';

const PAYERS = ['YSK', 'FMH'];
const PAYMENT_METHODS = ['信用卡', '現金', '轉賬', 'Alipay'];

const PAYER_STYLES = {
  YSK: {
    button: 'bg-emerald-600/20 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-900/20',
    badge: 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/40'
  },
  FMH: {
    button: 'bg-violet-600/20 border-violet-500 text-violet-200 shadow-lg shadow-violet-900/20',
    badge: 'bg-violet-500/15 text-violet-200 border border-violet-500/40'
  },
  DEFAULT: {
    button: 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800',
    badge: 'bg-slate-800 text-slate-300 border border-slate-700'
  }
};

const PAYMENT_METHOD_STYLES = {
  信用卡: {
    button: 'bg-cyan-600/20 border-cyan-500 text-cyan-200',
    badge: 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/40'
  },
  現金: {
    button: 'bg-amber-500/20 border-amber-500 text-amber-200',
    badge: 'bg-amber-500/15 text-amber-200 border border-amber-500/40'
  },
  轉賬: {
    button: 'bg-fuchsia-600/20 border-fuchsia-500 text-fuchsia-200',
    badge: 'bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-500/40'
  },
  Alipay: {
    button: 'bg-emerald-600/20 border-emerald-500 text-emerald-200',
    badge: 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/40'
  },
  OTHER: {
    button: 'bg-rose-600/20 border-rose-500 text-rose-200',
    badge: 'bg-rose-500/15 text-rose-200 border border-rose-500/40'
  }
};

const getPayerStyle = (payer, variant = 'button') => {
  const style = PAYER_STYLES[payer] || PAYER_STYLES.DEFAULT;
  return style[variant] || style.button;
};

const getPaymentMethodStyle = (method, variant = 'button') => {
  const value = String(method || '').trim();
  const style = PAYMENT_METHOD_STYLES[value] || PAYMENT_METHOD_STYLES.OTHER;
  return style[variant] || style.button;
};

const getLocalDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export {
  DEFAULT_CATEGORY_NAME,
  LEGACY_HOUSING_TRANSPORT_NAME,
  HOUSING_CATEGORY,
  TRANSPORT_CATEGORY,
  STORAGE_KEYS,
  INITIAL_CATEGORIES,
  CATEGORY_FILTER_ALL,
  FALLBACK_CATEGORY_COLOR,
  PAYERS,
  PAYMENT_METHODS,
  getPayerStyle,
  getPaymentMethodStyle,
  getLocalDateString
};

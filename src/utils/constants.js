// =========================================================================
// 📁 src/utils/constants.js (共用常數與共用函數)
// =========================================================================
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
  '信用卡': {
    button: 'bg-cyan-600/20 border-cyan-500 text-cyan-200',
    badge: 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/40'
  },
  '現金': {
    button: 'bg-amber-500/20 border-amber-500 text-amber-200',
    badge: 'bg-amber-500/15 text-amber-200 border border-amber-500/40'
  },
  '轉賬': {
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
  },
  DEFAULT: {
    button: 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800',
    badge: 'bg-slate-800 text-slate-400 border border-slate-700'
  }
};

const getPayerStyle = (payer, variant = 'button') => {
  const style = PAYER_STYLES[payer] || PAYER_STYLES.DEFAULT;
  return style[variant] || style.button;
};

const getPaymentMethodStyle = (method, variant = 'button') => {
  const value = String(method || '').trim();
  const style = PAYMENT_METHOD_STYLES[value] || (
    PAYMENT_METHODS.includes(value) ? PAYMENT_METHOD_STYLES[value] : PAYMENT_METHOD_STYLES.OTHER
  );
  return (style || PAYMENT_METHOD_STYLES.DEFAULT)[variant] || (style || PAYMENT_METHOD_STYLES.DEFAULT).button;
};

const getLocalDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export {
  INITIAL_CATEGORIES,
  PAYERS,
  PAYMENT_METHODS,
  PAYER_STYLES,
  PAYMENT_METHOD_STYLES,
  getPayerStyle,
  getPaymentMethodStyle,
  getLocalDateString
};
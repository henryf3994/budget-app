// =========================================================================
// 📁 src/utils/validation.js (驗證與共用函數)
// =========================================================================
import {
  DEFAULT_CATEGORY_NAME,
  HOUSING_CATEGORY,
  LEGACY_HOUSING_TRANSPORT_NAME,
  TRANSPORT_CATEGORY
} from './constants.js';
import { createId } from './id.js';

// --- 共用驗證輔助函數 ---

// 驗證金額是否為大於 0 的有效數字，並限制上限與小數位數
export const isValidAmount = value => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return false;
  if (num > 100000000) return false; // 上限 1 億
  // 限制最多 2 位小數
  const decimalPlaces = (String(value).split('.')[1] || '').length;
  return decimalPlaces <= 2;
};

// 去除前後空白並回傳純文字；空值回傳空字串
export const sanitizeText = value => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

// 驗證並修復 categories 資料結構，確保為合法陣列
export const ensureValidCategories = data => {
  if (!Array.isArray(data)) return [];
  return data.filter(c => c && typeof c === 'object' && c.id && c.name);
};

// 舊版把「住屋」與「交通」合併成單一類別（INITIAL_CATEGORIES 的 cat_1），
// 已存進 localStorage 的 app_categories 不會因為改常數而更新，
// 因此載入時做一次性拆分：舊類別換成「住屋」，並在其後補上「交通」。
// 其餘類別與使用者自訂項目（含顏色、快速標題）保持不變；已遷移過的資料原樣回傳。
export const migrateLegacyCategories = (categories, legacyName = LEGACY_HOUSING_TRANSPORT_NAME) => {
  const valid = ensureValidCategories(categories);
  if (!valid.some(c => c.name === legacyName)) return valid;

  // 使用者若已自行新增「交通」，就不再插入第二個同名類別
  const hasTransport = valid.some(c => c.name === TRANSPORT_CATEGORY.name);

  return valid.flatMap(c => {
    if (c.name !== legacyName) return [c];
    // 沿用舊項目的 id，讓 React key 與已選取的類別篩選在拆分後保持有效
    // （ensureValidCategories 已保證項目具備 id）
    const housing = { ...HOUSING_CATEGORY, id: c.id };
    return hasTransport ? [housing] : [housing, { ...TRANSPORT_CATEGORY }];
  });
};

// 驗證日期是否為有效 YYYY-MM-DD 格式
export const isValidDate = value => {
  if (!value) return false;
  const str = String(value).trim();
  // 支援 YYYY-MM-DD 或 ISO 字串（取前 10 字元）
  const datePart = str.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return false;
  const [year, month, day] = datePart.split('-').map(Number);
  if (year < 2000 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  // 驗證實際日期（處理 2 月 30 日等無效日期）
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
};

// 驗證並修復單筆交易資料結構，確保欄位安全
// 日期無效或金額非正數的資料視為無效（回傳 null），由呼叫端過濾，
// 避免產生「空白日期／0 元」的幽靈列
export const sanitizeTransaction = t => {
  if (!t || typeof t !== 'object') return null;
  const amount = Number(t.amount);
  if (!isValidDate(t.date) || !Number.isFinite(amount) || amount <= 0) return null;
  return {
    id: t.id || createId('tx_'),
    date: String(t.date).slice(0, 10),
    amount,
    category: sanitizeText(t.category) || DEFAULT_CATEGORY_NAME,
    title: sanitizeText(t.title) || '未命名支出',
    payer: sanitizeText(t.payer),
    paymentMethod: sanitizeText(t.paymentMethod),
    note: sanitizeText(t.note)
  };
};

// 驗證並修復恆常開支資料結構
export const sanitizeRecurring = r => {
  if (!r || typeof r !== 'object') return null;
  const day = Number(r.dayOfMonth);
  return {
    id: r.id || createId('rec_'),
    amount: Number.isFinite(Number(r.amount)) && Number(r.amount) > 0 ? Number(r.amount) : 0,
    category: sanitizeText(r.category) || DEFAULT_CATEGORY_NAME,
    title: sanitizeText(r.title) || '未命名恆常開支',
    payer: sanitizeText(r.payer),
    paymentMethod: sanitizeText(r.paymentMethod),
    note: sanitizeText(r.note),
    frequency: sanitizeText(r.frequency) || 'Monthly',
    dayOfMonth: Number.isInteger(day) && day >= 1 && day <= 31 ? day : 1
  };
};

// --- 欄位級驗證（回傳 errors 物件，供 Modal 顯示欄位錯誤） ---

export const validateTransactionFields = (formData = {}) => {
  const errors = {};
  if (!isValidAmount(formData?.amount)) {
    errors.amount = '請輸入大於 0 且最多 2 位小數的金額！';
  }
  if (!sanitizeText(formData?.title)) {
    errors.title = '請填寫項目標題！';
  }
  if (formData?.isCustomPayment && !sanitizeText(formData?.customPaymentMethod)) {
    errors.customPaymentMethod = '請填寫自訂付款方式！';
  }
  if (!isValidDate(formData?.date)) {
    errors.date = '請選擇有效日期！';
  }
  return errors;
};

export const validateRecurringFields = (formData = {}) => {
  const errors = {};
  if (!isValidAmount(formData?.amount)) {
    errors.amount = '請輸入大於 0 且最多 2 位小數的金額！';
  }
  if (!sanitizeText(formData?.title)) {
    errors.title = '請填寫項目標題！';
  }
  if (formData?.isCustomPayment && !sanitizeText(formData?.customPaymentMethod)) {
    errors.customPaymentMethod = '請填寫自訂付款方式！';
  }
  const day = Number(formData?.dayOfMonth);
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    errors.dayOfMonth = '請輸入 1 至 31 之間的扣款日期！';
  }
  return errors;
};

// --- 表單級驗證（回傳單一錯誤訊息或 null，供 App.jsx 使用） ---

export const validateTransactionForm = (formData = {}) => {
  const errors = validateTransactionFields(formData);
  const messages = Object.values(errors);
  return messages.length > 0 ? messages[0] : null;
};

export const validateRecurringForm = (formData = {}) => {
  const errors = validateRecurringFields(formData);
  const messages = Object.values(errors);
  return messages.length > 0 ? messages[0] : null;
};

// --- 其他共用函數 ---

export const normalizePaymentMethod = formData => {
  if (!formData) return '';
  return formData.isCustomPayment ? sanitizeText(formData.customPaymentMethod) : sanitizeText(formData.paymentMethod);
};

// 驗證 URL 是否為合法的 HTTPS URL
// 僅允許 https——財務資料端點不應以明文 http 傳輸
export const isValidUrl = value => {
  const str = sanitizeText(value);
  if (!str) return false;
  try {
    const url = new URL(str);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
};

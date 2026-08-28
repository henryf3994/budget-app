// =========================================================================
// 📁 src/utils/storage.js (localStorage 安全包裝)
// =========================================================================
// 部分瀏覽器／隱私瀏覽模式會封鎖 localStorage 存取並拋出例外，
// 直接呼叫可能讓 App 在啟動或寫入時整個當機，因此統一包裝 try/catch。

// 安全讀取；讀不到或被封鎖時回傳 fallback
export const safeGetItem = (key, fallback = '') => {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
};

// 安全寫入；成功回傳 true，被封鎖／超額時回傳 false（不拋錯）
export const safeSetItem = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

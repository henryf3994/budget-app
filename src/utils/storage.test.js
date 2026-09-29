// =========================================================================
// 📁 src/utils/storage.test.js (localStorage 安全包裝的測試)
// =========================================================================
// storage.js 存取 window.localStorage，而 vite.config.js 的測試環境是 'node'
// （專案未安裝 jsdom），因此這裡用 vi.stubGlobal 自行注入假的 window。
// 重點驗證「被封鎖時不拋錯、改回退 fallback」這個安全承諾——
// 隱私瀏覽模式或儲存空間被鎖時，App 不應該在啟動或寫入時當機。
import { afterEach, describe, expect, it, vi } from 'vitest';
import { safeGetItem, safeSetItem } from './storage.js';

// 建立可注入錯誤的假 localStorage，模擬隱私模式／配額爆掉等被封鎖情境
const createFakeStorage = ({ entries = {}, getItemError, setItemError } = {}) => {
  const store = new Map(Object.entries(entries));

  return {
    getItem: key => {
      if (getItemError) throw getItemError;
      return store.has(key) ? store.get(key) : null;
    },
    setItem: (key, value) => {
      if (setItemError) throw setItemError;
      store.set(key, String(value));
    },
    // 供斷言實際寫入的內容
    snapshot: () => Object.fromEntries(store)
  };
};

const stubWindowWith = localStorage => vi.stubGlobal('window', { localStorage });
const stubWindowMissing = () => vi.stubGlobal('window', undefined);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('safeGetItem', () => {
  it('讀取既有的值', () => {
    stubWindowWith(createFakeStorage({ entries: { app_gas_url: 'https://example.com/exec' } }));
    expect(safeGetItem('app_gas_url')).toBe('https://example.com/exec');
  });

  it('鍵不存在時回傳 fallback（預設為空字串）', () => {
    stubWindowWith(createFakeStorage());
    expect(safeGetItem('missing')).toBe('');
    expect(safeGetItem('missing', 'DEFAULT')).toBe('DEFAULT');
  });

  it('已存在但值為空字串時回傳空字串，不誤用 fallback', () => {
    // App.jsx 以 falsy 判斷是否採用 INITIAL_CATEGORIES，此行為是分類初始化的前提
    stubWindowWith(createFakeStorage({ entries: { app_categories: '' } }));
    expect(safeGetItem('app_categories', 'FALLBACK')).toBe('');
  });

  it('fallback 可為非字串', () => {
    stubWindowWith(createFakeStorage());
    expect(safeGetItem('missing', null)).toBeNull();
  });

  it('localStorage 被瀏覽器封鎖時回傳 fallback 且不拋錯', () => {
    stubWindowWith(createFakeStorage({ getItemError: new Error('SecurityError: localStorage is disabled') }));
    expect(() => safeGetItem('app_gas_url')).not.toThrow();
    expect(safeGetItem('app_gas_url', 'SAFE')).toBe('SAFE');
  });

  it('沒有 window（node／SSR 環境）時回傳 fallback 且不拋錯', () => {
    stubWindowMissing();
    expect(() => safeGetItem('app_gas_url')).not.toThrow();
    expect(safeGetItem('app_gas_url', 'SAFE')).toBe('SAFE');
  });
});

describe('safeSetItem', () => {
  it('成功寫入回傳 true 且值確實存入', () => {
    const storage = createFakeStorage();
    stubWindowWith(storage);

    expect(safeSetItem('app_categories', '[]')).toBe(true);
    expect(storage.snapshot()).toEqual({ app_categories: '[]' });
  });

  it('覆寫既有鍵值', () => {
    stubWindowWith(createFakeStorage({ entries: { app_categories: 'old' } }));

    expect(safeSetItem('app_categories', 'new')).toBe(true);
    expect(safeGetItem('app_categories')).toBe('new');
  });

  it('配額爆掉（QuotaExceededError）時回傳 false 且不拋錯', () => {
    stubWindowWith(createFakeStorage({ setItemError: new Error('QuotaExceededError') }));

    expect(() => safeSetItem('app_categories', 'x'.repeat(10))).not.toThrow();
    expect(safeSetItem('app_categories', 'x'.repeat(10))).toBe(false);
  });

  it('沒有 window（node／SSR 環境）時回傳 false 且不拋錯', () => {
    stubWindowMissing();
    expect(() => safeSetItem('app_categories', '[]')).not.toThrow();
    expect(safeSetItem('app_categories', '[]')).toBe(false);
  });

  it('非字串值由 localStorage 自行轉型', () => {
    const storage = createFakeStorage();
    stubWindowWith(storage);

    expect(safeSetItem('app_count', 3)).toBe(true);
    expect(storage.snapshot()).toEqual({ app_count: '3' });
  });
});

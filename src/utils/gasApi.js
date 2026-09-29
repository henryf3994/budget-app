// 單一 GAS 請求的預設逾時（毫秒）。GAS /exec 冷啟動偏慢，
// 但若超過此時間仍未回應，通常是請求卡住而非仍在處理，直接中止以免 UI 一直卡在載入中。
export const GAS_REQUEST_TIMEOUT_MS = 20000;

// 將外部 signal（例如載入取消用的 AbortController）與逾時計時器合併成單一 signal。
// 回傳 cleanup 供 finally 呼叫，避免計時器與事件監聽殘留。
const createTimeoutSignal = (externalSignal, timeoutMs) => {
  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const handleExternalAbort = () => controller.abort();

  if (externalSignal) {
    if (externalSignal.aborted) handleExternalAbort();
    else externalSignal.addEventListener('abort', handleExternalAbort, { once: true });
  }

  const cleanup = () => {
    clearTimeout(timer);
    if (externalSignal) externalSignal.removeEventListener('abort', handleExternalAbort);
  };

  return { signal: controller.signal, isTimedOut: () => timedOut, cleanup };
};

export const fetchJson = async (url, options = {}, timeoutMs = GAS_REQUEST_TIMEOUT_MS) => {
  const { signal: externalSignal, ...rest } = options;
  const { signal, isTimedOut, cleanup } = createTimeoutSignal(externalSignal, timeoutMs);
  try {
    const res = await fetch(url, { ...rest, signal });
    if (!res.ok) {
      throw new Error(`伺服器回應異常（HTTP ${res.status}）`);
    }
    try {
      return await res.json();
    } catch {
      throw new Error('伺服器回傳非 JSON 內容，請確認 GAS URL 是否正確');
    }
  } catch (err) {
    // 逾時中止與外部取消都會是 AbortError，需分別處理：
    // 逾時轉為可讀訊息；外部取消原樣拋出（呼叫端遇到 AbortError 會直接忽略）
    if (isTimedOut()) {
      throw new Error(`連線逾時（超過 ${Math.round(timeoutMs / 1000)} 秒），請稍後再試`);
    }
    throw err;
  } finally {
    cleanup();
  }
};

// 選用的 API Token：附加為網址查詢參數，供 GAS doGet(e) 以 e.parameter.token 驗證。
// （GAS 會將 /exec 的查詢參數轉交至 doGet，GET 讀取因此仍是 CORS 簡單請求，無需 preflight）
export const buildGasUrl = (url, token) => {
  if (!token) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}token=${encodeURIComponent(token)}`;
};

export const postToGAS = async (url, payload, token) => {
  const body = token ? { ...payload, token } : payload;
  return fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
    redirect: 'follow'
  });
};

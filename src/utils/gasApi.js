export const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`伺服器回應異常（HTTP ${res.status}）`);
  }
  try {
    return await res.json();
  } catch {
    throw new Error('伺服器回傳非 JSON 內容，請確認 GAS URL 是否正確');
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
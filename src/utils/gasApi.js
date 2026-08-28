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

export const postToGAS = async (url, payload) => fetchJson(url, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  body: JSON.stringify(payload),
  redirect: 'follow'
});
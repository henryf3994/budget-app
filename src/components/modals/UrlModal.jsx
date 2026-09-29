import { useRef, useState } from 'react';
import { X, Database } from 'lucide-react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside.js';

// =========================================================================
// 📁 src/components/modals/UrlModal.jsx
// =========================================================================
function UrlModal({ initialUrl, initialToken = '', onClose, onSave }) {
  const [url, setUrl] = useState(initialUrl);
  const [token, setToken] = useState(initialToken);
  const modalRef = useRef(null);
  useOnClickOutside(modalRef, onClose);

  const handleSave = () => {
    onSave(url.trim(), token.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="url-modal pixel-card bg-surface-warm max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-ink">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-ink mb-2 flex items-center gap-2">
          <Database className="w-5 h-5 text-primary-dark" />
          設定 Google Apps Script URL
        </h3>
        <p className="text-xs text-muted mb-4">
          請貼上部署為「網頁應用程式 (Web App)」時獲得的 `https://script.google.com/macros/s/.../exec` 網址。
        </p>

        <div className="pixel-border-sm p-0.5 mb-4">
          <input
            type="text"
            placeholder="https://script.google.com/macros/s/.../exec"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="relative z-0 w-full bg-surface-soft border-0 rounded-none px-3 py-2 text-ink text-xs font-mono focus:outline-none"
          />
        </div>

        <p className="text-xs text-muted mb-1">
          API Token（選填）：如 GAS 端已於 Script Properties 設定 <code className="text-ink">GAS_API_TOKEN</code>
          ，需填寫相同 Token 才能讀寫；可留空。
        </p>
        <div className="pixel-border-sm p-0.5 mb-4">
          <input
            type="text"
            placeholder="輸入口令 Token"
            value={token}
            onChange={e => setToken(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="relative z-0 w-full bg-surface-soft border-0 rounded-none px-3 py-2 text-ink text-xs font-mono focus:outline-none"
          />
        </div>

        <button onClick={handleSave} className="pixel-button-primary w-full py-2">
          儲存並連線
        </button>
      </div>
    </div>
  );
}

export default UrlModal;

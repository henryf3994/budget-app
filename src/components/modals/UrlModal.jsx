
import React, { useState } from 'react';
import { X, Database } from 'lucide-react';

// =========================================================================
// 📁 src/components/modals/UrlModal.jsx
// =========================================================================
function UrlModal({ initialUrl, onClose, onSave }) {
  const [url, setUrl] = useState(initialUrl);

  const handleSave = () => {
    onSave(url);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" />
          設定 Google Apps Script URL
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          請貼上部署為「網頁應用程式 (Web App)」時獲得的 `https://script.google.com/macros/s/.../exec` 網址。
        </p>

        <input 
          type="text"
          placeholder="https://script.google.com/macros/s/.../exec"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500 mb-4"
        />

        <button 
          onClick={handleSave}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-xl transition"
        >
          儲存並連線
        </button>
      </div>
    </div>
  );
}

export default UrlModal;

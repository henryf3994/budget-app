
import React, { useState, useRef } from 'react';
import { X, Settings, Trash2 } from 'lucide-react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside.js';

// =========================================================================
// 📁 src/components/modals/CategoryModal.jsx
// =========================================================================
function CategoryModal({ categories, onClose, onAddCategory, onDeleteCategory }) {
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');
  const [newCatTitles, setNewCatTitles] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const modalRef = useRef(null);
  useOnClickOutside(modalRef, onClose);
  
  const handleAdd = () => {
    const trimmedName = newCatName.trim();
    if (!trimmedName) {
      setErrorMsg('請輸入類別名稱！');
      return;
    }
    // 檢查重複名稱
    const isDuplicate = (categories || []).some(c => c?.name === trimmedName);
    if (isDuplicate) {
      setErrorMsg('此類別名稱已存在，請使用其他名稱！');
      return;
    }
    const defaultTitlesArr = newCatTitles
      .split(/[,，\n]/)
      .map(t => t.trim())
      .filter(Boolean);

    onAddCategory({
      id: 'cat_' + Date.now(),
      name: trimmedName,
      color: newCatColor,
      defaultTitles: defaultTitlesArr.length > 0 ? defaultTitlesArr : ['一般支出']
    });
    setNewCatName('');
    setNewCatTitles('');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          類別與熱門標題管理
        </h3>

        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl mb-4 space-y-2">
          <div className="text-xs font-semibold text-slate-300">新增分類與快速標題：</div>
          <div className="flex items-center gap-2">
            <input 
              type="color" 
              value={newCatColor}
              onChange={(e) => setNewCatColor(e.target.value)}
              className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
            />
            <input 
              type="text" 
              maxLength={20}
              placeholder="類別名稱 (如: 寵物生活)"
              value={newCatName}
              onChange={(e) => {
                setNewCatName(e.target.value);
                setErrorMsg('');
              }}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
            />
          </div>
          {errorMsg && <p className="text-[11px] text-rose-400">{errorMsg}</p>}
          <input 
            type="text" 
            maxLength={200}
            placeholder="預設熱門標題，用逗號分隔 (如: 糧食, 診所, 玩具)"
            value={newCatTitles}
            onChange={(e) => setNewCatTitles(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
          />
          <button 
            onClick={handleAdd}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-1.5 rounded-lg transition"
          >
            + 新增類別
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {categories.map(cat => (
            <div key={cat.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }}></span>
                <div>
                  <div className="text-sm font-semibold text-white">{cat.name}</div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                    預設: {cat.defaultTitles ? cat.defaultTitles.join(', ') : '無'}
                  </div>
                </div>
              </div>
              <button onClick={() => onDeleteCategory(cat.id)} className="text-slate-500 hover:text-rose-400 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryModal;

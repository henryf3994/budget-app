
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
        className="category-modal pixel-card bg-surface-warm max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-ink">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary-dark" />
          類別與熱門標題管理
        </h3>

        <div className="pixel-border-sm bg-surface p-3 rounded-pixel-sm mb-4 space-y-2">
          <div className="text-xs font-semibold text-primary-dark">新增分類與快速標題：</div>
          <div className="flex items-center gap-2">
            <input 
              type="color" 
              value={newCatColor}
              onChange={(e) => setNewCatColor(e.target.value)}
              className="w-8 h-8 rounded-pixel-sm border-2 border-ink bg-surface-warm cursor-pointer"
            />
            <div className="pixel-border-sm flex-1 p-0.5">
              <input 
                type="text" 
                maxLength={20}
                placeholder="類別名稱 (如: 寵物生活)"
                value={newCatName}
                onChange={(e) => {
                  setNewCatName(e.target.value);
                  setErrorMsg('');
                }}
                className="relative z-0 w-full bg-surface-soft border-0 rounded-none px-3 py-1.5 text-xs text-ink focus:outline-none"
              />
            </div>
          </div>
          {errorMsg && <p className="text-[11px] text-danger">{errorMsg}</p>}
          <div className="pixel-border-sm p-0.5">
            <input 
              type="text" 
              maxLength={200}
              placeholder="預設熱門標題，用逗號分隔 (如: 糧食, 診所, 玩具)"
              value={newCatTitles}
              onChange={(e) => setNewCatTitles(e.target.value)}
              className="relative z-0 w-full bg-surface-soft border-0 rounded-none px-3 py-1.5 text-xs text-ink focus:outline-none"
            />
          </div>
          <button 
            onClick={handleAdd}
            className="pixel-button-primary w-full text-xs py-1.5"
          >
            + 新增類別
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {categories.map(cat => (
            <div key={cat.id} className="pixel-border-sm p-3 bg-surface flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }}></span>
                <div>
                  <div className="text-sm font-semibold text-ink">{cat.name}</div>
                  <div className="text-[10px] text-muted truncate max-w-[200px]">
                    預設: {cat.defaultTitles ? cat.defaultTitles.join(', ') : '無'}
                  </div>
                </div>
              </div>
              <button onClick={() => onDeleteCategory(cat.id)} className="transaction-action-button text-danger p-1" title="刪除類別">
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

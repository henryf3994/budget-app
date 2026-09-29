import { useState, useRef } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { DEFAULT_CATEGORY_NAME, PAYERS, PAYMENT_METHODS, getPaymentMethodStyle } from '../../utils/constants.js';
import { useOnClickOutside } from '../../hooks/useOnClickOutside.js';
import { buildSubmittedFormData, resolveCustomPaymentState } from '../../utils/formHelpers.js';
import { validateRecurringFields } from '../../utils/validation.js';
import { getPayerAvatar } from '../../utils/payerAvatars.js';

// =========================================================================
// 📁 src/components/modals/RecurringModal.jsx
// =========================================================================
function RecurringModal({ categories = [], onClose, onAdd, loading, initialRecurring, onUpdate }) {
  const modalRef = useRef(null);
  useOnClickOutside(modalRef, onClose);

  // 安全取得第一個分類名稱
  const safeCategories = Array.isArray(categories) ? categories : [];
  const defaultCategory = safeCategories[0]?.name || DEFAULT_CATEGORY_NAME;
  const defaultPayer = PAYERS[0];
  const defaultPaymentMethod = PAYMENT_METHODS[0];

  // 編輯模式：傳入 initialRecurring 即代表編輯既有的恆常開支
  const isEditing = !!initialRecurring;

  // 新增表單的初始／重設狀態（提交後重設共用此函數，避免兩份物件漂移）
  const createEmptyRecurring = () => ({
    amount: '',
    category: defaultCategory,
    title: '',
    payer: defaultPayer,
    paymentMethod: defaultPaymentMethod,
    customPaymentMethod: '',
    isCustomPayment: false,
    note: '',
    frequency: 'Monthly',
    dayOfMonth: 1
  });

  // 編輯模式：以既有恆常開支資料預填表單
  const createInitialRecurring = () => {
    const item = initialRecurring;
    if (!item) return createEmptyRecurring();
    const resolved = resolveCustomPaymentState(item);
    return {
      amount: String(item.amount ?? ''),
      category: safeCategories.some(c => c.name === item.category) ? item.category : defaultCategory,
      title: item.title || '',
      payer: item.payer || defaultPayer,
      paymentMethod: resolved.paymentMethod,
      customPaymentMethod: resolved.customPaymentMethod,
      isCustomPayment: resolved.isCustomPayment,
      note: item.note || '',
      frequency: item.frequency || 'Monthly',
      dayOfMonth: item.dayOfMonth || 1
    };
  };

  const [newRec, setNewRec] = useState(isEditing ? createInitialRecurring : createEmptyRecurring);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = e => {
    e.preventDefault();

    const errors = validateRecurringFields(newRec);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const finalData = buildSubmittedFormData(newRec);

    if (isEditing) {
      // 保留原本的 id（以及 initialRecurring 上的其他唯讀欄位）
      onUpdate({ ...initialRecurring, ...finalData });
    } else {
      onAdd(finalData);
      setNewRec(createEmptyRecurring());
      setFieldErrors({});
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="recurring-modal pixel-card bg-surface-warm max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-ink">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-primary-dark" />
          {isEditing ? '編輯恆常開支' : '新增恆常開支'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-muted mb-1">項目標題</label>
            <div className="pixel-border-sm p-0.5">
              <input
                type="text"
                required
                maxLength={50}
                placeholder="請輸入固定支出名稱"
                value={newRec.title}
                onChange={e => {
                  setNewRec({ ...newRec, title: e.target.value });
                  setFieldErrors(prev => ({ ...prev, title: '' }));
                }}
                className="relative z-0 w-full bg-surface-soft border-0 rounded-none px-3 py-2 text-sm text-ink focus:outline-none"
              />
            </div>
            {fieldErrors.title && <p className="text-[11px] text-danger mt-1">{fieldErrors.title}</p>}
          </div>

          <div>
            <label className="block text-lg font-medium text-muted mb-1">金額</label>
            <div className="pixel-border-sm relative p-0.5">
              <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted text-sm font-semibold">
                HK$
              </span>
              <input
                type="number"
                step="1"
                required
                placeholder="0"
                value={newRec.amount}
                onChange={e => {
                  setNewRec({ ...newRec, amount: e.target.value });
                  setFieldErrors(prev => ({ ...prev, amount: '' }));
                }}
                className={`relative z-0 w-full bg-surface-soft border-0 rounded-none pl-12 pr-3 py-2 text-ink text-base font-bold focus:outline-none ${
                  fieldErrors.amount ? 'border-danger' : 'border-ink focus:border-primary'
                }`}
              />
            </div>
            {fieldErrors.amount && <p className="text-[11px] text-danger mt-1">{fieldErrors.amount}</p>}
          </div>

          <div>
            <label className="block text-lg font-medium text-muted mb-1">類別</label>
            <div className="pixel-border-sm p-0.5">
              <select
                value={newRec.category}
                onChange={e => setNewRec({ ...newRec, category: e.target.value })}
                className="relative z-0 w-full bg-surface-soft border-0 rounded-none px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary"
              >
                {safeCategories.length > 0 ? (
                  safeCategories.map(c => (
                    <option key={c.id || c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <option value={DEFAULT_CATEGORY_NAME}>{DEFAULT_CATEGORY_NAME}</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium text-muted mb-1">付款人</label>
            <div className="grid grid-cols-2 gap-2">
              {PAYERS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewRec({ ...newRec, payer: p })}
                  className={`pixel-border-sm py-2 px-3 rounded-xl text-sm font-semibold transition ${
                    newRec.payer === p
                      ? `payer-option-selected bg-surface-soft ${p === 'YSK' ? 'payer-option-selected-ysk' : 'payer-option-selected-fmh'}`
                      : 'bg-surface-soft border-2 border-ink text-muted hover:bg-surface-warm'
                  }`}
                  aria-label={`付款人 ${p}`}
                >
                  <img
                    className={`h-12 w-full object-contain ${p === 'FMH' ? 'scale-110' : ''}`}
                    src={getPayerAvatar(p)}
                    alt={p}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium text-muted mb-1">付款方式</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {PAYMENT_METHODS.map(pm => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setNewRec({ ...newRec, paymentMethod: pm, isCustomPayment: false })}
                  className={`pixel-border-sm py-1.5 px-3 rounded-xl border text-[15.6px] font-medium transition ${
                    !newRec.isCustomPayment && newRec.paymentMethod === pm
                      ? getPaymentMethodStyle(pm, 'button')
                      : 'bg-surface-soft border-2 border-ink text-muted hover:bg-surface-warm'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
            <input
              type="text"
              maxLength={30}
              placeholder="自訂其他付款方式..."
              value={newRec.customPaymentMethod}
              onChange={e => {
                setNewRec({
                  ...newRec,
                  customPaymentMethod: e.target.value,
                  isCustomPayment: true
                });
                setFieldErrors(prev => ({ ...prev, customPaymentMethod: '' }));
              }}
              className={`pixel-border-sm w-full bg-surface-soft border-2 rounded-pixel-sm px-3 py-1.5 text-xs text-ink focus:outline-none ${
                newRec.isCustomPayment ? 'border-danger bg-surface-warm' : 'border-ink'
              } ${fieldErrors.customPaymentMethod ? 'border-danger' : ''}`}
            />
            {fieldErrors.customPaymentMethod && (
              <p className="text-[11px] text-danger mt-1">{fieldErrors.customPaymentMethod}</p>
            )}
          </div>

          <div>
            <label className="block text-lg font-medium text-muted mb-1">每月扣款日</label>
            <div className="flex items-center gap-2">
              <div className="pixel-border-sm flex-1 p-0.5">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={newRec.dayOfMonth}
                  onChange={e => {
                    setNewRec({ ...newRec, dayOfMonth: e.target.value });
                    setFieldErrors(prev => ({ ...prev, dayOfMonth: '' }));
                  }}
                  className="relative z-0 w-full bg-surface-soft border-0 rounded-none px-3 py-2 text-[21px] text-ink text-center focus:outline-none"
                />
              </div>
              <span className="text-[21px] text-muted shrink-0">號</span>
            </div>
            {fieldErrors.dayOfMonth && <p className="text-[11px] text-danger mt-1">{fieldErrors.dayOfMonth}</p>}
          </div>

          <div>
            <label className="block text-lg font-medium text-muted mb-1">備註</label>
            <div className="pixel-border-sm p-0.5">
              <input
                type="text"
                maxLength={200}
                placeholder="可留空"
                value={newRec.note}
                onChange={e => setNewRec({ ...newRec, note: e.target.value })}
                className="relative z-0 w-full bg-surface-soft border-0 rounded-none px-3 py-2 text-sm text-ink focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            {isEditing && (
              <button type="button" onClick={onClose} className="pixel-button-accent w-1/2 py-2.5">
                取消
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`pixel-button-primary py-2.5 ${isEditing ? 'w-1/2' : 'w-full'}`}
            >
              {loading ? '正在提交中...' : isEditing ? '儲存修改' : '確認新增恆常開支'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecurringModal;

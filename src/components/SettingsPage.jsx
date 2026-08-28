import React from 'react';
import { Database, RefreshCw, Settings } from 'lucide-react';

export default function SettingsPage({ gasUrl, loading, onRefresh, onOpenUrlModal, onOpenCategoryModal }) {
  return (
    <section className="overview-font space-y-6">
      <div className="pixel-card border-4 bg-surface-warm p-5 shadow-pixel-lg sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <Settings className="h-7 w-7 text-accent-dark" />
          <div>
            <h2 className="text-2xl font-extrabold text-ink">設定</h2>
            <p className="text-sm text-ink-soft">管理資料連線與記賬類別</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="pixel-button-primary flex min-h-28 flex-col items-center justify-center gap-2 px-4 py-4 text-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? '重新整理中…' : '重新整理數據'}</span>
          </button>

          <button
            onClick={onOpenUrlModal}
            className="pixel-button-accent flex min-h-28 flex-col items-center justify-center gap-2 px-4 py-4 text-center"
          >
            <Database className="h-6 w-6" />
            <span>設定 GAS API URL</span>
            <span className="max-w-full truncate text-xs font-normal opacity-75">{gasUrl || '尚未設定'}</span>
          </button>

          <button
            onClick={onOpenCategoryModal}
            className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-pixel-sm border-2 border-ink bg-surface px-4 py-4 text-center font-bold text-ink shadow-pixel-sm transition hover:bg-surface-warm"
          >
            <Settings className="h-6 w-6 text-accent-dark" />
            <span>管理類別與顏色</span>
          </button>
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { Database, RefreshCw, Settings } from 'lucide-react';

export default function SettingsPage({ gasUrl, hasToken = false, loading, onRefresh, onOpenUrlModal, onOpenCategoryModal }) {
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

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="pixel-card relative flex min-h-28 flex-col overflow-hidden p-5 text-left transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-[var(--color-secondary)]"></div>
            <div className="flex items-start justify-between gap-3">
              <span className="font-pixel text-base font-semibold text-ink-soft tracking-wider uppercase mb-1 md:text-lg">
                {loading ? '重新整理中…' : '重新整理數據'}
              </span>
              <span className="inline-flex items-center justify-center p-2 rounded-pixel-sm bg-orange-50 border-2 border-primary text-primary">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </span>
            </div>
            <div className="font-pixel mt-3 text-sm text-muted">
              同步最新記賬資料
            </div>
          </button>

          <button
            onClick={onOpenUrlModal}
            className="pixel-card relative flex min-h-28 flex-col overflow-hidden p-5 text-left transition-transform hover:-translate-y-0.5"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-[var(--color-secondary)]"></div>
            <div className="flex items-start justify-between gap-3">
              <span className="font-pixel text-base font-semibold text-ink-soft tracking-wider uppercase mb-1 md:text-lg">
                設定 GAS API URL
              </span>
              <span className="inline-flex items-center justify-center p-2 rounded-pixel-sm bg-yellow-50 border-2 border-accent text-accent">
                <Database className="w-4 h-4" />
              </span>
            </div>
            <div className="font-pixel mt-3 text-sm text-muted">
              {gasUrl ? (
                <span className="block max-w-full truncate" title={gasUrl}>{gasUrl}</span>
              ) : (
                '尚未設定'
              )}
              <span className={`block mt-1 text-xs ${hasToken ? 'text-success' : 'text-danger'}`}>
                {hasToken ? '✓ 已設定 API Token 驗證' : '未設定 API Token（端點為公開狀態）'}
              </span>
            </div>
          </button>

          <button
            onClick={onOpenCategoryModal}
            className="pixel-card relative flex min-h-28 flex-col overflow-hidden p-5 text-left transition-transform hover:-translate-y-0.5"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-[var(--color-secondary)]"></div>
            <div className="flex items-start justify-between gap-3">
              <span className="font-pixel text-base font-semibold text-ink-soft tracking-wider uppercase mb-1 md:text-lg">
                管理類別與顏色
              </span>
              <span className="inline-flex items-center justify-center p-2 rounded-pixel-sm bg-teal-50 border-2 border-secondary text-secondary">
                <Settings className="w-4 h-4" />
              </span>
            </div>
            <div className="font-pixel mt-3 text-sm text-muted">
              新增/編輯分類與快速標題
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}

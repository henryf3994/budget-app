import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // 目前僅測試純函數（utils/），不需要 DOM 環境；
    // 之後若要測試元件，安裝 jsdom 後改成 environment: 'jsdom' 即可。
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
    globals: false
  }
});

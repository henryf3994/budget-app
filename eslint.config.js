import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },

  js.configs.recommended,

  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.flat.recommended.rules,
      // 使用自動 JSX runtime（@vitejs/plugin-react），檔案內不需要 import React
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      // 純 JS 專案沒有 prop-types；元件的輸入輸出由單元測試把關
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // 避免在宣告前引用變數（先前 App.jsx 的 effect 就誤用了尚未定義的函式）；
      // 函式宣告（hoisting 合法）不在此限。
      'no-use-before-define': ['error', { functions: false, classes: true, variables: true }]
    }
  },

  // 設定檔在 Node 環境執行
  {
    files: ['**/*.config.js'],
    languageOptions: { globals: { ...globals.node } }
  },

  // 必須放在最後：關閉所有與 Prettier 衝突的格式規則
  prettier
];

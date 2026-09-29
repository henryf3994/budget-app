/** @type {import('prettier').Config} */
export default {
  // 與現有程式碼風格對齊：單引號、保留分號、不加尾隨逗號、2 空格縮排
  printWidth: 120,
  singleQuote: true,
  semi: true,
  trailingComma: 'none',
  // 專案既有風格為單參數箭頭函數不加括號
  arrowParens: 'avoid',
  endOfLine: 'lf'
};

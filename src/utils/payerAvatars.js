// =========================================================================
// 📁 src/utils/payerAvatars.js (付款人頭像)
// =========================================================================
// 原本三個 Modal 各自在元件內建立同一份頭像對照表（每次 render 都重建），
// 這裡集中成單一模組，元件只需 getPayerAvatar(payer)。
import fmhAvatar from '../assets/fmh.png';
import yskAvatar from '../assets/ysk.png';

export const PAYER_AVATARS = {
  YSK: yskAvatar,
  FMH: fmhAvatar
};

export const getPayerAvatar = payer => PAYER_AVATARS[payer];

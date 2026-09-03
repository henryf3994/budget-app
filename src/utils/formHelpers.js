import { PAYMENT_METHODS } from './constants.js';
import { normalizePaymentMethod, sanitizeText } from './validation.js';

export const resolveCustomPaymentState = (formData = {}) => {
  const paymentValue = formData?.paymentMethod;
  const isCustomPayment = !!paymentValue && !PAYMENT_METHODS.includes(paymentValue);

  return {
    paymentMethod: isCustomPayment ? PAYMENT_METHODS[0] : (paymentValue || PAYMENT_METHODS[0]),
    customPaymentMethod: isCustomPayment ? paymentValue : '',
    isCustomPayment
  };
};

export const buildSubmittedFormData = (formData = {}) => ({
  ...formData,
  title: sanitizeText(formData.title),
  paymentMethod: normalizePaymentMethod(formData)
});

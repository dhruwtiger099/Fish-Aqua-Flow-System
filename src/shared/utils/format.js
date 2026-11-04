export const formatCurrency = (value, currency = '₹') =>
  `${currency}${Number(value || 0).toLocaleString('en-IN')}`;
export const formatQuantity = (value, unit = '') =>
  `${Number(value || 0).toLocaleString('en-IN')}${unit ? ` ${unit}` : ''}`;

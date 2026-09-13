export const formatNumber = (number) => {
  if (typeof number !== 'number') {
    return number;
  }
  return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

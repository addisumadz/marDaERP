import { generateWordVariants } from './amharicSearchUtils';

export const amharicFuzzyFilter = (row, columnId, filterValue) => {
  if (!row || !row.original || !filterValue) return false;

  const value = row.original[columnId];
  if (typeof value !== 'string') return false;

  const normalized = value.replace(/\s+/g, '').toLowerCase();
  const variants = generateWordVariants(filterValue.replace(/\s+/g, '').toLowerCase());

  return variants.some((variant) => normalized.includes(variant));
};

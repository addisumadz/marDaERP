export const users = [
  { id: "1", name: "Abebe", username: "abebe", password: "123456" },
  // { id: "2", name: "Marry", username: "kegne", password: "000111" },
];

// 12-month Ethiopian calendar month names (Amharic) for billing/business usage.
// Pagume (13th month) is intentionally excluded.
export const ETH_MONTHS_AM = [
  "መስከረም", // 1
  "ጥቅምት", // 2
  "ኅዳር",   // 3
  "ታህሣሥ", // 4
  "ጥር",    // 5
  "የካቲት", // 6
  "መጋቢት", // 7
  "ሚያዚያ", // 8
  "ግንቦት", // 9
  "ሰኔ",    // 10
  "ሐምሌ",  // 11
  "ነሐሴ",  // 12
];

// Options array convenient for Select components
export const ETH_MONTHS_AM_OPTIONS = ETH_MONTHS_AM.map((label, idx) => ({
  value: idx + 1, // 1..12
  label,
}));

// Map month name -> 1..12 index
export const ETH_MONTH_INDEX_BY_NAME = ETH_MONTHS_AM.reduce((acc, name, idx) => {
  acc[name] = idx + 1;
  return acc;
}, {});

// Billing-safe previous month (1..12 only, wraps 1 -> 12)
export function getPreviousBillingMonthNumber(monthNumber) {
  if (typeof monthNumber !== 'number' || isNaN(monthNumber)) return null;
  if (monthNumber <= 1) return 12;
  if (monthNumber > 12) return 12;
  return monthNumber - 1;
}

// Billing-safe previous month by name
export function getPreviousBillingMonthName(monthName) {
  const idx = ETH_MONTH_INDEX_BY_NAME[monthName];
  if (!idx) return null;
  const prev = getPreviousBillingMonthNumber(idx);
  return ETH_MONTHS_AM[prev - 1];
}

/**
 * Formats a number/string price as Nigerian Naira, e.g. formatNaira(45000) -> "₦45,000.00".
 * Central place for currency formatting — change it here if you ever need
 * a different currency or format, instead of hunting through every page.
 */
export function formatNaira(value) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(number);
}

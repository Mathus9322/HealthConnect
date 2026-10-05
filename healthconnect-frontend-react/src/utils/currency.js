// Formatage des montants en francs CFA (ex : 15000 -> "15 000")
export const CURRENCY = "F CFA";

export const formatAmount = (amount) => {
  const value = Number(amount);
  if (amount === null || amount === undefined || amount === "" || isNaN(value)) return null;
  return Math.round(value).toLocaleString("fr-FR").replace(/\s/g, " ");
};

export const formatPrice = (amount) => {
  const formatted = formatAmount(amount);
  return formatted ? `${formatted} ${CURRENCY}` : null;
};

export const DEFAULT_PRICING = {
  monthly: 490000,
  quarterly: 1290000,
  halfYear: 2390000,
  annual: 4490000,
  currency: 'UZS',
  installationSupport: 150000,
};

export function normalizePricing(input = {}) {
  const num = (value, fallback) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  return {
    monthly: num(input.monthly, DEFAULT_PRICING.monthly),
    quarterly: num(input.quarterly, DEFAULT_PRICING.quarterly),
    halfYear: num(input.halfYear, DEFAULT_PRICING.halfYear),
    annual: num(input.annual, DEFAULT_PRICING.annual),
    currency: String(input.currency || DEFAULT_PRICING.currency),
    installationSupport: num(input.installationSupport, DEFAULT_PRICING.installationSupport),
  };
}

export function makePlansFromPricing(pricingInput = {}) {
  const pricing = normalizePricing(pricingInput);
  return {
    m1: { months: 1, amountUZS: pricing.monthly, label: 'Sinov' },
    m3: { months: 3, amountUZS: pricing.quarterly, label: 'Trader' },
    m6: { months: 6, amountUZS: pricing.halfYear, label: 'Professional' },
    y1: { months: 12, amountUZS: pricing.annual, label: 'Elite' },
  };
}

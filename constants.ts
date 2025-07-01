
import { Currency, ExchangeRateState, AppSettings, AllExchangeRates } from './types';

export const CURRENCIES: Currency[] = ['VES', 'COP', 'USD', 'EUR'];

export const CURRENCY_LABELS: Record<Currency, string> = {
  VES: 'Bolívares',
  COP: 'Pesos Colombianos',
  USD: 'Dólares',
  EUR: 'Euros',
};

export const CURRENCY_LABELS_SINGULAR: Record<Currency, string> = {
  VES: 'Bolívar',
  COP: 'Peso Colombiano',
  USD: 'Dólar',
  EUR: 'Euro',
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  VES: 'Bs.',
  COP: 'COP',
  USD: '$',
  EUR: '€',
};

export const CURRENCY_VALUE_RANK: Record<Currency, number> = {
  EUR: 4,
  USD: 3,
  VES: 2,
  COP: 1,
};

// Initial data for rate pairs, keys are ordered: HigherRankCurrency_LowerRankCurrency
// Value: 1 unit of HigherRankCurrency = X units of LowerRankCurrency
// These serve as a fallback if the first API fetch fails.
export const initialOfficialExchangeRates: AllExchangeRates = {
  'USD_VES': { value: 36.50, source: 'BCV', type: 'oficial', isDirect: true }, // 1 USD = 36.50 VES
  'EUR_VES': { value: 39.80, source: 'BCV', type: 'oficial', isDirect: true }, // 1 EUR = 39.80 VES
  'USD_COP': { value: 4000.00, source: 'BANREP', type: 'oficial', isDirect: true }, // 1 USD = 4000.00 COP
  'EUR_USD': { value: 1.08, source: 'BCE', type: 'oficial', isDirect: true }, // 1 EUR = 1.08 USD
};

// Initial state for exchange rates, including data and metadata
export const initialExchangeRateState: ExchangeRateState = {
  officialRates: initialOfficialExchangeRates,
  manualRates: {},
  preferredRateTypes: {}, // Added for user's rate type preference per pair
  lastCloudFetchDate: new Date(0).toISOString(), // Ensures first fetch happens
};


export const initialAppSettings: AppSettings = {
  darkMode: false,
  copMultiplyByThousand: false,
};

export const KEYPAD_LAYOUT: string[][] = [
  ['C', '(', ')', '%'],
  ['7', '8', '9', '/'],
  ['4', '5', '6', '*'],
  ['1', '2', '3', '-'],
  ['0', ',', '=', '+'],
];


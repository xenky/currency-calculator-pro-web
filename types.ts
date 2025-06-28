
export type Currency = 'VES' | 'COP' | 'USD' | 'EUR';

export type RateEntrySource = 'BCV' | 'BANREP' | 'BCE' | 'Manual' | 'Derived' | 'System';

// Renamed from Rate to RateEntry to avoid potential conflicts and improve clarity
export interface RateEntry {
  value: number;
  source: RateEntrySource; 
  isDirect?: boolean; 
  type: 'oficial' | 'manual' | 'derived' | 'identity'; // Changed 'cloud' to 'oficial'
}

// Represents the collection of rate pairs
export interface AllExchangeRates {
  [pair: string]: RateEntry; // Example: "USD_VES": { value: 36.5, source: "BCV", type: "oficial" }
}

// Represents the state slice for exchange rates including metadata like last fetch date
export interface ExchangeRateState {
  officialRates: AllExchangeRates; // Stores rates from BCV, BANREP etc.
  manualRates: AllExchangeRates;   // Stores rates set manually by the user
  preferredRateTypes: { [pairKey: string]: 'oficial' | 'manual' }; // Stores user preference for rate type per pair
  lastCloudFetchDate?: string; // Date string for official rates, format can be DD/MM/YYYY or ISO
}


export interface AppSettings {
  darkMode: boolean;
  copMultiplyByThousand: boolean;
}

export interface HistoryEntry {
  id: number;
  expression: string;
  result: string;
  currency: Currency;
  timestamp: string;
}

export interface ConversionRateInfo {
  pair: string; 
  value: number;
  source: RateEntry['source'];
  isDirect: boolean; 
}

// New type for the data structure from the official rates JSON endpoint
export interface FetchedCloudRates {
  date: string; // e.g., "12/12/2025"
  BCV: {
    usdves: number;
    eurves: number;
  };
  BanRep: {
    usdcop: number;
  };
  BCE: {
    eurusd: number;
  };
}


export interface RateSourceInfo {
  sourceName: RateEntry['source']; 
  ratePair: string; 
  rateValue: number;
}

export type ActiveView = 'calculator' | 'history' | 'about';

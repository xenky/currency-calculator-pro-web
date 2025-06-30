
import { Currency, AllExchangeRates, RateEntry, ConversionRateInfo, FetchedCloudRates, RateEntrySource } from '../types';
import { CURRENCY_VALUE_RANK } from '../constants';

// Added export here
export interface RateMatrix {
  [fromCurrency: string]: {
    [toCurrency: string]: {
      value: number; 
      source: RateEntry['source'] | 'No Disponible'; 
    };
  };
}

/**
 * Creates a standardized currency pair key string, with the higher value currency first.
 * e.g., createOrderedPairKey('VES', 'USD') -> "USD_VES"
 */
export const createOrderedPairKey = (c1: Currency, c2: Currency): string => {
  if (c1 === c2) throw new Error("Cannot create a pair key for the same currency.");
  if (CURRENCY_VALUE_RANK[c1] > CURRENCY_VALUE_RANK[c2]) {
    return `${c1}_${c2}`;
  } else {
    return `${c2}_${c1}`;
  }
};

// Helper to create the full matrix of conversion multipliers
// The matrix provides: 1 unit of 'from' currency = X units of 'to' currency
export const getFullRateMatrix = (activeRates: AllExchangeRates, officialRates: AllExchangeRates): RateMatrix => {
  const matrix: RateMatrix = {};
  const currencies: Currency[] = ['VES', 'COP', 'USD', 'EUR'];

  const getRateValueFromStore = (rates: AllExchangeRates, cFrom: Currency, cTo: Currency): { value?: number, source?: RateEntry['source'] } => {
    if (cFrom === cTo) return { value: 1, source: 'System' };
    const orderedKey = createOrderedPairKey(cFrom, cTo);
    const rateEntry = rates[orderedKey];

    if (rateEntry) {
      if (CURRENCY_VALUE_RANK[cFrom] > CURRENCY_VALUE_RANK[cTo]) { 
        return { value: rateEntry.value, source: rateEntry.source }; 
      } else { 
        return { value: 1 / rateEntry.value, source: rateEntry.source }; 
      }
    }
    return {};
  };

  for (const from of currencies) {
    matrix[from] = {};
    for (const to of currencies) {
      if (from === to) {
        matrix[from][to] = { value: 1, source: 'System' };
        continue;
      }

      // First, try for a direct or user-preferred rate from the activeRates.
      let directConversion = getRateValueFromStore(activeRates, from, to);
      if (directConversion.value !== undefined && directConversion.source) {
        matrix[from][to] = { value: directConversion.value, source: directConversion.source };
      } else {
        // If no direct/preferred rate, try to derive via USD using ONLY official rates.
        if (from !== 'USD' && to !== 'USD') {
          const fromToUsdData = getRateValueFromStore(officialRates, from, 'USD');
          const usdToToData = getRateValueFromStore(officialRates, 'USD', to);

          if (fromToUsdData.value && usdToToData.value) {
            matrix[from][to] = { 
              value: fromToUsdData.value * usdToToData.value, 
              source: 'Derived' 
            };
          } else {
            matrix[from][to] = { value: 0, source: 'No Disponible' };
          }
        } else {
          matrix[from][to] = { value: 0, source: 'No Disponible' };
        }
      }
    }
  }
  return matrix;
};


export const applyRateUpdate = (
  currentRateCollection: AllExchangeRates, // This will be either officialRates or manualRates
  baseCurrency: Currency, 
  quoteCurrency: Currency, 
  value: number, 
  sourceName: RateEntrySource // 'BCV', 'BANREP', 'BCE', or 'Manual'
): AllExchangeRates => {
  if (baseCurrency === quoteCurrency) return currentRateCollection;
  if (value <= 0) {
      console.error("Rate value must be positive.");
      return currentRateCollection; 
  }

  const newRateData = { ...currentRateCollection };
  const orderedKey = createOrderedPairKey(baseCurrency, quoteCurrency);
  const [higherRankedCurrency] = orderedKey.split('_') as [Currency, Currency];

  let valueToStore: number;
  if (baseCurrency === higherRankedCurrency) { 
    valueToStore = value;
  } else { 
    valueToStore = 1 / value;
  }
  
  let type: RateEntry['type'];
  if (sourceName === 'Manual') {
    type = 'manual';
  } else if (sourceName === 'BCV' || sourceName === 'BANREP' || sourceName === 'BCE') {
    type = 'oficial';
  } else {
    console.warn(`Unexpected sourceName "${sourceName}" in applyRateUpdate, defaulting type to 'derived'.`);
    type = 'derived'; 
  }

  newRateData[orderedKey] = {
    value: valueToStore,
    source: sourceName,
    type: type, 
    isDirect: true, 
  };

  return newRateData;
};

export const parseAndApplyFetchedRates = (
    fetchedData: FetchedCloudRates,
    currentOfficialRates: AllExchangeRates
): AllExchangeRates => {
    let updatedRates = { ...currentOfficialRates };

    if (fetchedData.BCV) {
        if (fetchedData.BCV.usdves) updatedRates = applyRateUpdate(updatedRates, 'USD', 'VES', fetchedData.BCV.usdves, 'BCV');
        if (fetchedData.BCV.eurves) updatedRates = applyRateUpdate(updatedRates, 'EUR', 'VES', fetchedData.BCV.eurves, 'BCV');
    }
    if (fetchedData.BanRep) {
        if (fetchedData.BanRep.usdcop) updatedRates = applyRateUpdate(updatedRates, 'USD', 'COP', fetchedData.BanRep.usdcop, 'BANREP');
    }
    if (fetchedData.BCE) {
        if (fetchedData.BCE.eurusd) updatedRates = applyRateUpdate(updatedRates, 'EUR', 'USD', fetchedData.BCE.eurusd, 'BCE');
    }
    
    return updatedRates;
};

/**
 * Gets rate information for display purposes.
 * The `pair` string is always HigherRank/LowerRank.
 * The `value` is always "how many LowerRank units for 1 HigherRank unit".
 */
export const getRateDisplayInfo = (
  inputCurrency: Currency, 
  outputCurrency: Currency, 
  allRates: AllExchangeRates, // This will be the merged activeRateData
  rateMatrix: RateMatrix 
): ConversionRateInfo | null => {
  if (inputCurrency === outputCurrency) {
    const pairLabel = `${inputCurrency}/${inputCurrency}`; 
    return { pair: pairLabel, value: 1, source: 'System', isDirect: true };
  }

  const orderedKey = createOrderedPairKey(inputCurrency, outputCurrency);
  const [higherRanked, lowerRanked] = orderedKey.split('_') as [Currency, Currency]; // Corrected destructuring
  const displayPairString = `${higherRanked}/${lowerRanked}`;

  const directRateEntry = allRates[orderedKey];

  if (directRateEntry) {
    return {
      pair: displayPairString,
      value: directRateEntry.value, 
      source: directRateEntry.source,
      isDirect: directRateEntry.isDirect !== undefined ? directRateEntry.isDirect : true,
    };
  }
  
  const matrixEntry = rateMatrix[inputCurrency]?.[outputCurrency];
  if (matrixEntry && matrixEntry.value !== 0 && matrixEntry.source !== 'No Disponible') {
    let displayValueForPair: number;
    // The matrixEntry.value is already "1 inputCurrency = X outputCurrency"
    // We need to present it as "1 higherRanked = Y lowerRanked"
    if (higherRanked === inputCurrency) { 
      // inputCurrency is higherRanked, outputCurrency is lowerRanked
      // matrixEntry.value is 1 inputCurrency = X outputCurrency
      // So, displayValueForPair is X (e.g. 1 USD = 35 VES)
      displayValueForPair = matrixEntry.value;
    } else { 
      // inputCurrency is lowerRanked, outputCurrency is higherRanked
      // matrixEntry.value is 1 inputCurrency = X outputCurrency (e.g. 1 VES = 0.028 USD)
      // We want "1 outputCurrency (higher) = Y inputCurrency (lower)"
      // So, displayValueForPair is 1 / matrixEntry.value (e.g. 1 USD = 1/0.028 VES = 35 VES)
      displayValueForPair = 1 / matrixEntry.value;
    }
    const validSource: RateEntrySource = (matrixEntry.source === 'Derived' || matrixEntry.source === 'System' || matrixEntry.source === 'BCV' || matrixEntry.source === 'BANREP' || matrixEntry.source === 'BCE' || matrixEntry.source === 'Manual') 
                        ? matrixEntry.source 
                        : 'Derived'; // Default to derived if somehow an unexpected source like 'No Disponible' slips through value check
    return {
      pair: displayPairString,
      value: displayValueForPair,
      source: validSource, 
      isDirect: false, 
    };
  }
  
  return null; 
};

import { AppSettings, FetchedCloudRates, Currency } from '../types';

/**
 * Formats a number for display, using comma as decimal separator and period as thousands separator.
 * @param num The number to format.
 * @param minFractionDigits Minimum number of decimal places.
 * @param keepTrailingZeros If true, ensures exactly minFractionDigits are shown, padding with zeros or rounding.
 * @returns Formatted string.
 */
export const formatNumberForDisplay = (num: number | string, minFractionDigits: number = 2, keepTrailingZeros: boolean = false): string => {
  if (num === null || num === undefined) return '-.--';
  let numberToFormat: number;
  if (typeof num === 'string') {
    numberToFormat = parseFloat(parseDisplayNumber(num).toString());
  } else {
    numberToFormat = num;
  }

  if (isNaN(numberToFormat)) return 'Error';

  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: minFractionDigits,
    // If keepTrailingZeros is true, force maximumFractionDigits to be same as minFractionDigits for strict formatting
    maximumFractionDigits: keepTrailingZeros ? minFractionDigits : Math.max(minFractionDigits, 6),
  };
  
  let formatted = numberToFormat.toLocaleString('es-VE', options);

  // If keepTrailingZeros is false, apply original trimming logic for excess zeros beyond minFractionDigits
  if (!keepTrailingZeros && minFractionDigits > 0 && formatted.includes(',')) {
    const parts = formatted.split(',');
    if (parts.length > 1) {
        let fraction = parts[1];
        // Trim trailing zeros only if current fraction length is greater than minFractionDigits
        while(fraction.length > minFractionDigits && fraction.endsWith('0')) {
            fraction = fraction.slice(0, -1);
        }
        // If all fractional digits were zeros and trimmed, and minFractionDigits allows removal (e.g. min 0)
        // or if fraction length is now 0 (e.g. 1,00 with min 0 became 1)
        if (fraction.length === 0 ) { 
             // If minFractionDigits is 0, we want just the integer part.
             // If minFractionDigits > 0, toLocaleString with options should have handled it.
             // This case is more about when minFractionDigits is, say, 2, but the value is 1.00000 and we don't want 1,00
             // but current logic of Intl handles this correctly with min/max FractionDigits.
             // The only case this needs to adjust is if we trimmed to nothing AND minFractionDigits was 0.
             if (minFractionDigits === 0) formatted = parts[0];
             else formatted = `${parts[0]},${fraction.padEnd(minFractionDigits, '0')}`; // Ensure min length if not 0
        } else {
             formatted = `${parts[0]},${fraction}`;
        }
    }
  }
  return formatted;
};


/**
 * Parses a display-formatted number string (comma decimal, period thousands) into a standard number string (period decimal).
 * @param displayNum The display-formatted number string.
 * @returns A standard number string or the original if not parsable.
 */
export const parseDisplayNumber = (displayNum: string): number => {
  if (typeof displayNum !== 'string') return NaN;
  const standardNumStr = displayNum.replace(/\./g, '').replace(',', '.');
  return parseFloat(standardNumStr);
};

export const fetchOfficialRates = async (): Promise<FetchedCloudRates> => {
    const response = await fetch('https://raw.githubusercontent.com/xenky/exchange_rates/main/rates.json');
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    return response.json();
};

export const calculateEffectiveValue = (value: number, currency: Currency, settings: AppSettings): number => {
  if (currency === 'COP' && settings.copMultiplyByThousand) {
    return value * 1000;
  }
  return value;
};


import React from 'react';
import { Currency, ConversionRateInfo } from '../types';
import { CURRENCY_LABELS } from '../constants';
import { formatNumberForDisplay } from '../services/calculatorService';
import { SettingsIcon } from './icons/SettingsIcon';
import styles from './styles/component.module.css';

interface CurrencyOutputProps {
  currency: Currency;
  value: number | null;
  rateInfo: ConversionRateInfo | null;
  onSettingsClick: () => void;
  isInputCurrency: boolean;
  onCurrencySelect: (currency: Currency) => void;
  inputDisplayComponent?: React.ReactNode;
}

const CURRENCY_SHORTCUTS: Record<Currency, string> = {
  VES: 'b',
  COP: 'p',
  USD: 'd',
  EUR: 'e',
};

export const CurrencyOutput: React.FC<CurrencyOutputProps> = ({
  currency,
  value,
  rateInfo,
  onSettingsClick,
  isInputCurrency,
  onCurrencySelect,
  inputDisplayComponent,
}) => {
  const formattedValue = value !== null ? formatNumberForDisplay(value, 2, true) : '-.--';

  const handleCardClick = () => {
    if (!isInputCurrency) {
      onCurrencySelect(currency);
    }
  };

  if (isInputCurrency && inputDisplayComponent) {
    return <>{inputDisplayComponent}</>;
  }

  const currencyShortcut = CURRENCY_SHORTCUTS[currency];
  const settingsShortcut = `Ctrl + ${currencyShortcut}`;

  return (
    <div 
      className={`space-y-1 ${styles.outputContainer}`} 
      onClick={handleCardClick}
      title={`Seleccionar ${CURRENCY_LABELS[currency]} (Atajo: ${currencyShortcut.toUpperCase()})`}
    >
      <div className={`${styles.outputCard} rounded-lg shadow transition-all duration-200 flex items-center h-full justify-between px-2 cursor-pointer bg-white dark:bg-slate-700`}>
        <div className='flex flex-col flex-grow truncate min-w-0'>
          <span className={`${styles.outputLabel} font-medium text-slate-600 dark:text-slate-300`}>{CURRENCY_LABELS[currency]}</span>
          <div className={`${styles.outputValue} text-right font-mono text-slate-800 dark:text-white truncate`}>
            {formattedValue}
          </div>
          {rateInfo && (
            <div className={`${styles.outputRateInfo} text-xs text-right text-slate-500 dark:text-slate-400 truncate`}>
              {rateInfo.source} - {rateInfo.pair}: {formatNumberForDisplay(rateInfo.value, 2, true)}
            </div>
          )}
          {value === null && !rateInfo?.value && (
            <div className="text-xs text-right text-red-500 dark:text-red-400">
              Tasa no disponible
            </div>
          )}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onSettingsClick(); }} 
          className="p-1 ml-2 text-slate-500 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-500 flex-shrink-0 h-full flex items-center"
          aria-label={`Ajustar tasa para ${currency}`}
          title={`Ajustes de ${CURRENCY_LABELS[currency]} (Atajo: ${settingsShortcut})`}
        >
          <SettingsIcon className="h-1/2 w-auto" />
        </button>
      </div>
    </div>
  );
};



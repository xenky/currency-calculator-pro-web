
import React from 'react';
import { Currency, ConversionRateInfo } from '../types';
import { CURRENCY_LABELS } from '../constants';
import { formatNumberForDisplay } from '../services/calculatorService';
import { SettingsIcon } from './icons/SettingsIcon';
import  styles from './styles/component.module.css';

interface CurrencyOutputProps {
  currency: Currency;
  value: number | null;
  rateInfo: ConversionRateInfo | null;
  onSettingsClick: () => void;
  isInputCurrency: boolean;
}

export const CurrencyOutput: React.FC<CurrencyOutputProps> = ({ currency, value, rateInfo, onSettingsClick, isInputCurrency }) => {
  const formattedValue = value !== null ? formatNumberForDisplay(value, 2, true) : '-.--';

  /* const valueFontSize = formattedValue.length > 15 ? (formattedValue.length > 22 ? 'text-base' : 'text-lg') : 'text-xl'; */
  
  return (
    <div className={`${styles.outputContainer} space-y-1 `}>
      <div className={`${styles.outputCard} rounded-lg shadow transition-all duration-200 flex flex-col h-full justify-between px-2 ${isInputCurrency ? 'bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-400 dark:border-indigo-600' : 'bg-white dark:bg-slate-700'}`}>
        <div className="flex  justify-between items-center mb-0.5">
          <span className={`${styles.outputLabel} font-medium text-slate-600 dark:text-slate-300`}>{CURRENCY_LABELS[currency]}</span>
          {!isInputCurrency && (
            <button onClick={onSettingsClick} className="p-1 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400" aria-label={`Ajustar tasa para ${currency}`}>
              <SettingsIcon className={`${styles.outputIcon}`} />
            </button>
          )}
        </div>
        <div className={`${styles.outputValue} text-right font-mono text-slate-800 dark:text-white truncate`}>
          {formattedValue}
        </div>
        {rateInfo && (
          <div className={`${styles.outputRateInfo} text-xs text-right text-slate-500 dark:text-slate-400`}>
            {rateInfo.source} - {rateInfo.pair}: {formatNumberForDisplay(rateInfo.value, 2, true)}
          </div>
        )}
        {value === null && !rateInfo?.value && !isInputCurrency && (
          <div className="text-xs text-right text-red-500 dark:text-red-400">
            Tasa no disponible
          </div>
        )}
      </div>
    </div>
  );
};



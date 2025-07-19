
import React, { useRef, useLayoutEffect } from 'react';
import { Currency } from '../types';
import { CURRENCY_LABELS } from '../constants';
import styles from './styles/component.module.css';
import { formatNumberForDisplay } from '../services/calculatorService';

interface InputDisplayProps {
  value: string;
  activeInputCurrency: Currency;
  evaluationResult: number;
}

export const InputDisplay: React.FC<InputDisplayProps> = ({ value, activeInputCurrency, evaluationResult }) => {
  const formattedResult = formatNumberForDisplay(evaluationResult, 2, true);
  const displayFontSize = value.length > 13 ? (value.length > 20 ? `${styles.inputValueFont3}` : `${styles.inputValueFont2}`) : `${styles.inputValueFont}`;
  const inputRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.scrollLeft = inputRef.current.scrollWidth;
    }
  }, [value]);

  return (
    <div className="p-y-1 "><div className={`rounded-lg shadow transition-all duration-200 flex flex-col space-y-1 bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-400 dark:border-indigo-600 mx-1  ${styles.inputContainer} `}>
      <div className="flex justify-between items-center px-3 ">
        <span className={`font-medium text-white ${styles.inputLabel}`}>
          {CURRENCY_LABELS[activeInputCurrency]}
        </span>
      </div>

      <div className="flex items-center">
        <div className="flex-grow overflow-hidden">
          <div
            ref={inputRef}
            className={`text-right text-white font-mono ${displayFontSize} mx-3 overflow-x-auto custom-scrollbar whitespace-nowrap ${styles.inputValue} ${styles.inputValueFont} ${styles.inputScrollBar}`}
            style={{ direction: 'ltr' }}
          >
            {value || '0'}
          </div>
          <div className={`text-emerald-400 mx-3 text-end truncate min-w-0`}>{formattedResult || '0'}</div>
        </div>
      </div>
    </div>
    </div>
  );
};

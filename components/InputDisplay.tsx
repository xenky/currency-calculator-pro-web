
import React, { useRef, useLayoutEffect } from 'react';
import { BackspaceIcon } from './icons/BackspaceIcon';
import { Currency } from '../types';
import { CURRENCIES } from '../constants';
import  styles from './styles/component.module.css';

interface InputDisplayProps {
  value: string;
  onBackspace: () => void;
  activeInputCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

export const InputDisplay: React.FC<InputDisplayProps> = ({ value, onBackspace, activeInputCurrency, onCurrencyChange }) => {
  const displayFontSize = value.length > 13 ? (value.length > 20 ? `${styles.inputValueFont3}` : `${styles.inputValueFont2}`) : `${styles.inputValueFont}`;
  const inputRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.scrollLeft = inputRef.current.scrollWidth;
    }
  }, [value]);

  return (
    <div className={`${styles.inputContainer} bg-black dark:bg-black shadow-inner flex flex-col space-y-1`}>
      {/* Currency Selectors */}
      <div className="grid grid-cols-4 gap-2">
        {CURRENCIES.map(currency => (
          <button
            key={currency}
            onClick={() => onCurrencyChange(currency)}
            className={`${styles.inputCurrency} rounded-md transition-all duration-200 ease-in-out focus:outline-none active:bg-white/10 ${
              activeInputCurrency === currency 
                ? 'font-bold text-indigo-400 transform scale-110' 
                : 'font-medium text-white/70 hover:text-white'
            }`}
          >
            {currency}
          </button>
        ))}
      </div>
      
      {/* Input and Backspace */}
      <div className="flex items-center">
        <div className="flex-grow overflow-hidden">
          <div 
            ref={inputRef}
            className={`${styles.inputValue} ${styles.inputValueFont} ${styles.inputScrollBar} text-right text-white font-mono ${displayFontSize} ml-3 overflow-x-auto custom-scrollbar whitespace-nowrap`}
            style={{ direction: 'ltr' }}
          >
            {value || '0'}
          </div>
        </div>
        <button 
          onClick={onBackspace} 
          className={`${styles.inputContentButton} ml-3 rounded-lg active:bg-white/10 transition-colors`}
          aria-label="Retroceso"
        >
          <BackspaceIcon className={`${styles.inputButton} text-white`} />
        </button>
      </div>
    </div>
  );
};


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
  const displayFontSize = value.length > 15 ? (value.length > 25 ? 'text-xl' : 'text-2xl') : 'text-4xl';
  const inputRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.scrollLeft = inputRef.current.scrollWidth;
    }
  }, [value]);

  return (
    <div className="bg-black p-1 dark:bg-black shadow-inner flex flex-col space-y-1">
      {/* Currency Selectors */}
      <div className="grid grid-cols-4 gap-2">
        {CURRENCIES.map(currency => (
          <button
            key={currency}
            onClick={() => onCurrencyChange(currency)}
            className={`${styles.inputCurrency} py-1 text-sm rounded-md transition-all duration-200 ease-in-out focus:outline-none active:bg-white/10 ${
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
            className={`${styles.inputValue} text-right text-white font-mono ${displayFontSize} ml-3 py-2 overflow-x-auto custom-scrollbar whitespace-nowrap`}
            style={{ direction: 'ltr' }}
          >
            {value || '0'}
          </div>
        </div>
        <button 
          onClick={onBackspace} 
          className={`${styles.inputContentButton} ml-3 px-3 rounded-lg active:bg-white/10 transition-colors`}
          aria-label="Retroceso"
        >
          <BackspaceIcon className={`${styles.inputButton} w-8 h-8 sm:w-10 sm:h-10 text-white`} />
        </button>
      </div>
    </div>
  );
};
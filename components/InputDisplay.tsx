
import React, { useRef, useLayoutEffect } from 'react';
import { BackspaceIcon } from './icons/BackspaceIcon';
import { Currency } from '../types';
import { CURRENCIES } from '../constants';

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
    <div className="bg-black p-4 shadow-inner flex flex-col space-y-3">
      {/* Currency Selectors */}
      <div className="grid grid-cols-4 gap-2">
        {CURRENCIES.map(currency => (
          <button
            key={currency}
            onClick={() => onCurrencyChange(currency)}
            className={`py-1 text-sm rounded-md transition-all duration-200 ease-in-out focus:outline-none active:bg-white/10 ${
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
            className={`text-right text-white font-mono ${displayFontSize} py-2 overflow-x-auto custom-scrollbar whitespace-nowrap`}
            style={{ direction: 'ltr' }}
          >
            {value || '0'}
          </div>
        </div>
        <button 
          onClick={onBackspace} 
          className="ml-3 p-3 rounded-lg active:bg-white/10 transition-colors"
          aria-label="Retroceso"
        >
          <BackspaceIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </button>
      </div>
    </div>
  );
};
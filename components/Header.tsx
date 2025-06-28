
import React from 'react';
import { Currency, ActiveView } from '../types';
import { CURRENCIES } from '../constants';
import { MenuIcon } from './icons/MenuIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface HeaderProps {
  activeInputCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  onMenuToggle: () => void;
  activeView: ActiveView;
  headerTitle: string;
  onNavigateBack: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeInputCurrency, 
  onCurrencyChange, 
  onMenuToggle,
  activeView,
  headerTitle,
  onNavigateBack
}) => {
  return (
    <div className="bg-indigo-600 dark:bg-slate-800 text-white p-3 shadow-md">
      <div className="flex justify-between items-center mb-3">
        {activeView !== 'calculator' ? (
          <button onClick={onNavigateBack} className="p-2 rounded-full hover:bg-indigo-700 dark:hover:bg-slate-700" aria-label="Volver">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
        ) : (
          <div className="w-10"></div> // Placeholder for spacing consistency when back button is not shown
        )}
        <h1 className="text-xl font-semibold text-center">{headerTitle}</h1>
        <button onClick={onMenuToggle} className="p-2 rounded-full hover:bg-indigo-700 dark:hover:bg-slate-700" aria-label="Abrir menú">
          <MenuIcon className="w-6 h-6" />
        </button>
      </div>
      {activeView === 'calculator' && (
        <div className="grid grid-cols-4 gap-1">
          {CURRENCIES.map(currency => (
            <button
              key={currency}
              onClick={() => onCurrencyChange(currency)}
              className={`py-2 px-1 text-sm font-medium rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 dark:focus:ring-offset-slate-800 focus:ring-white
                ${activeInputCurrency === currency 
                  ? 'bg-white text-indigo-600 dark:bg-slate-600 dark:text-white shadow-md' 
                  : 'bg-indigo-500 hover:bg-indigo-400 dark:bg-slate-700 dark:hover:bg-slate-600'
                }`}
            >
              {currency}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

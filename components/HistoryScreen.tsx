
import React from 'react';
import { HistoryEntry, Currency } from '../types';
import { CURRENCIES, CURRENCY_LABELS, CURRENCY_SYMBOLS } from '../constants';
import { TrashIcon } from './icons/TrashIcon';
import { formatNumberForDisplay } from '../services/calculatorService';

interface HistoryScreenProps {
  history: HistoryEntry[];
  clearHistory: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ history, clearHistory }) => {
  const validHistory = history.filter(entry => entry.results && entry.inputCurrency);

  return (
    <div className="flex flex-col flex-grow p-4 bg-slate-100 dark:bg-slate-900 overflow-hidden">
      {validHistory.length > 0 && (
        <div className="mb-4 flex justify-end">
          <button 
            onClick={clearHistory} 
            className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg shadow transition-colors"
            aria-label="Limpiar historial"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Limpiar Historial
          </button>
        </div>
      )}
      {validHistory.length === 0 ? (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-slate-500 dark:text-slate-400 text-lg">No hay operaciones en el historial.</p>
        </div>
      ) : (
        <ul className="flex-grow space-y-3 overflow-y-auto custom-scrollbar pr-1 pb-4">
          {validHistory.map((entry: HistoryEntry) => {
            if (!entry.results || !entry.inputCurrency) return null;

            return (
              <li key={entry.id} className="text-sm p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md flex flex-col space-y-2">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Moneda de entrada: <span className="font-semibold">{CURRENCY_LABELS[entry.inputCurrency]}</span>
                </div>
                <div 
                  className="text-lg text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words font-mono" 
                  title={entry.expression}
                >
                  {entry.expression}
                </div>
                <div className="font-semibold text-sm sm:text-base text-indigo-600 dark:text-indigo-400 leading-tight flex flex-wrap items-center">
                  <span className="font-normal text-slate-800 dark:text-slate-200 mr-2">=</span>
                  <div className="flex-1 flex flex-wrap">
                    {CURRENCIES.map((currency, index) => (
                      <React.Fragment key={currency}>
                        <span className="inline-block whitespace-nowrap">
                          {formatNumberForDisplay(entry.results[currency] || 0, 2, true)}
                          <span className="text-sm font-normal ml-1 text-slate-600 dark:text-slate-300">{CURRENCY_SYMBOLS[currency]}</span>
                        </span>
                        {index < CURRENCIES.length - 1 && <span className="mx-1.5 text-slate-400 dark:text-slate-500">-</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 text-right pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                  {new Date(entry.timestamp).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  );
};
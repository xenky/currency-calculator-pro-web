
import React from 'react';
import { HistoryEntry } from '../types';
import { CURRENCY_SYMBOLS } from '../constants';
import { TrashIcon } from './icons/TrashIcon';

interface HistoryScreenProps {
  history: HistoryEntry[];
  clearHistory: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ history, clearHistory }) => {
  return (
    <div className="flex flex-col flex-grow p-4 bg-slate-100 dark:bg-slate-900 overflow-hidden">
      {history.length > 0 && (
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
      {history.length === 0 ? (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-slate-500 dark:text-slate-400 text-lg">No hay operaciones en el historial.</p>
        </div>
      ) : (
        <ul className="flex-grow space-y-3 overflow-y-auto custom-scrollbar pr-1 pb-4">
          {history.map((entry: HistoryEntry) => ( // Explicitly typing entry here
            <li key={entry.id} className="text-sm p-3 bg-white dark:bg-slate-800 rounded-lg shadow-md">
              <div 
                className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words mb-1" 
                title={entry.expression}
              >
                {entry.expression}
              </div>
              <div className="font-semibold text-lg text-indigo-600 dark:text-indigo-400 mb-1">
                = {entry.result} <span className="text-base">{CURRENCY_SYMBOLS[entry.currency]}</span>
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500 text-right">
                {new Date(entry.timestamp).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

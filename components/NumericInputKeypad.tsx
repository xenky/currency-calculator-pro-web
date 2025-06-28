import React from 'react';
import { BackspaceIcon } from './icons/BackspaceIcon';

interface NumericInputKeypadProps {
  onKeyPress: (key: string) => void;
}

const KEYPAD_NUMERIC_LAYOUT: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  [',', '0', '⌫'],
];

export const NumericInputKeypad: React.FC<NumericInputKeypadProps> = ({ onKeyPress }) => {
  return (
    <div className="grid grid-cols-3 gap-1 p-1 mt-2 bg-slate-100 dark:bg-slate-700 rounded-md">
      {KEYPAD_NUMERIC_LAYOUT.flat().map((key) => {
        let buttonClass = "py-2 sm:py-3 text-lg font-medium rounded shadow-sm active:shadow-inner transition-all duration-100 ease-in-out focus:outline-none focus:ring-1 focus:ring-opacity-50 ";

        if (key === '⌫') {
          buttonClass += "bg-slate-300 hover:bg-slate-400 dark:bg-slate-500 dark:hover:bg-slate-400 text-slate-800 dark:text-white focus:ring-slate-400";
        } else {
          buttonClass += "bg-white hover:bg-slate-50 text-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-white focus:ring-slate-300";
        }
        
        return (
          <button
            key={key}
            onClick={() => onKeyPress(key)}
            className={buttonClass}
            aria-label={key === '⌫' ? 'Retroceso' : key}
          >
            {key === '⌫' ? <BackspaceIcon className="w-5 h-5 mx-auto" /> : key}
          </button>
        );
      })}
    </div>
  );
};
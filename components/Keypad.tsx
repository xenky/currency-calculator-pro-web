
import React from 'react';
import { KEYPAD_LAYOUT } from '../constants';

interface KeypadProps {
  onKeyPress: (key: string) => void;
}

const getAriaLabelForKey = (key: string): string => {
  switch (key) {
    case 'C': return 'Borrar todo';
    case '(': return 'Abrir paréntesis';
    case ')': return 'Cerrar paréntesis';
    case '%': return 'Porcentaje';
    case '/': return 'Dividir';
    case '*': return 'Multiplicar';
    case '-': return 'Restar';
    case '+': return 'Sumar';
    case ',': return 'Coma decimal';
    case '=': return 'Igual';
    case '⌫': return 'Retroceso'; // Already handled by NumericInputKeypad if this was for it
    default: return key; // For numbers
  }
};

export const Keypad: React.FC<KeypadProps> = ({ onKeyPress }) => {
  return (
    <div className="grid grid-cols-4 gap-0.5 p-1 bg-slate-300 dark:bg-slate-800 shadow-inner" role="grid">
      {KEYPAD_LAYOUT.flat().map((key) => {
        const isOperator = ['/', '*', '-', '+', '%'].includes(key);
        const isEqual = key === '=';
        const isClear = key === 'C';
        const isSpecialFn = ['(', ')'].includes(key);

        let buttonClass = "py-1.5 sm:py-2 text-base sm:text-lg font-medium rounded shadow-sm active:shadow-inner transition-all duration-150 ease-in-out focus:outline-none focus:ring-1 focus:ring-opacity-50 ";

        if (isEqual) {
          buttonClass += "bg-indigo-500 hover:bg-indigo-600 text-white col-span-1 focus:ring-indigo-400";
        } else if (isOperator) {
          buttonClass += "bg-slate-400 hover:bg-slate-500 text-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-white focus:ring-slate-400";
        } else if (isClear) {
           buttonClass += "bg-red-400 hover:bg-red-500 text-white focus:ring-red-300";
        } else if (isSpecialFn) {
            buttonClass += "bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-500 dark:hover:bg-slate-400 dark:text-slate-100 focus:ring-slate-300";
        }
         else { // Numbers and comma
          buttonClass += "bg-white hover:bg-slate-50 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white focus:ring-slate-300";
        }

        return (
          <button
            key={key}
            onClick={() => onKeyPress(key)}
            className={buttonClass}
            aria-label={getAriaLabelForKey(key)}
            role="gridcell"
          >
            {key}
          </button>
        );
      })}
    </div>
  );
};

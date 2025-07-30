
import React from 'react';
import { KEYPAD_LAYOUT } from '../constants';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import  styles from './styles/component.module.css';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  isModalOpen?: boolean;
  className?: string;
}

const getAriaLabelForKey = (key: string): string => {
  switch (key) {
    case 'C': return 'Borrar todo (Supr)';
    case '( )': return 'Abrir paréntesis';
    case '%': return 'Porcentaje';
    case '/': return 'Dividir';
    case '*': return 'Multiplicar';
    case '-': return 'Restar';
    case '+': return 'Sumar';
    case ',': return 'Coma decimal';
    case '=': return 'Igual (Enter)';
    case '⌫': return 'Retroceso (Backspace)';
    default: return key;
  }
};

export const Keypad: React.FC<KeypadProps> = ({ onKeyPress, isModalOpen, className }) => {
  const shortcuts = [
    ...KEYPAD_LAYOUT.flat().map((key) => ({
      key: key === '⌫' ? 'Backspace' : key === 'C' ? 'Delete' : key === '=' ? 'Enter' : key,
      handler: () => onKeyPress(key),
    })),
    { key: 'Escape', handler: () => onKeyPress('C') },
    { key: 'Backspace', handler: () => onKeyPress('⌫') },
    { key: 'Enter', handler: () => onKeyPress('=') },
    { key: 'Delete', handler: () => onKeyPress('C') },
    { key: '.', handler: () => onKeyPress(',') },
  ];

  useKeyboardShortcut(shortcuts, { disabled: isModalOpen });

  return (
    <div className={`grid grid-cols-4 auto-rows-fr h-full gap-0.5 p-1 bg-slate-300 dark:bg-slate-800 shadow-inner ${className || ''}`} role="grid">
      {KEYPAD_LAYOUT.flat().map((key) => {
        const isOperator = ['/', '*', '-', '+', '%'].includes(key);
        const isEqual = key === '=';
        const isClear = key === 'C';
        const isBackspace = key === '⌫';
        const isSpecialFn = ['( )'].includes(key);

        let buttonClass = 'font-medium rounded-sm shadow-sm active:scale-95 transform-gpu  focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-300 dark:focus-visible:ring-offset-slate-800';

        if (isEqual) {
          buttonClass += ' bg-indigo-600 active:bg-indigo-600 text-white dark:bg-indigo-600 col-span-1 focus-visible:ring-indigo-500' ;
        } else if (isOperator) {
          buttonClass += " bg-slate-400 active:bg-slate-500 text-slate-800 dark:bg-slate-600 dark:active:bg-slate-500 dark:text-white focus-visible:ring-slate-500";
        } else if (isClear || isBackspace) {
           buttonClass += ' bg-red-400 active:bg-red-500 text-white dark:bg-red-400 focus-visible:ring-red-500 ';
        } else if (isSpecialFn) {
            buttonClass += " bg-slate-200 active:bg-slate-300 text-slate-700 dark:bg-slate-500 dark:active:bg-slate-400 dark:text-slate-100 focus-visible:ring-slate-400";
        }
         else { // Numbers and comma
          // Using a slightly darker active state for number keys for better feedback
          buttonClass += " bg-white active:bg-slate-100 text-slate-800 dark:bg-slate-700 dark:active:bg-slate-600 dark:text-white focus-visible:ring-indigo-500";
        }

        return (
          <button
            key={key}
            onClick={() => onKeyPress(key)}
            className={`${buttonClass} ${styles.keypadButton} `}
            aria-label={getAriaLabelForKey(key)}
            role="gridcell"
            title={getAriaLabelForKey(key)}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
};



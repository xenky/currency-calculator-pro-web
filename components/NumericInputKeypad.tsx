import React from 'react';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import { BackspaceIcon } from './icons/BackspaceIcon';
import  styles from './styles/component.module.css';

interface NumericInputKeypadProps {
  onKeyPress: (key: string) => void;
  isModalOpen?: boolean;
  isMobileLandscape?: boolean;
}

const KEYPAD_NUMERIC_LAYOUT: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  [',', '0', '⌫'],
  ['', 'C', ''],
];

export const NumericInputKeypad: React.FC<NumericInputKeypadProps> = ({ onKeyPress, isModalOpen, isMobileLandscape }) => {
  const shortcuts = [
    ...KEYPAD_NUMERIC_LAYOUT.flat().map((key) => ({
      key: key === '⌫' ? 'Backspace' : key === 'C' ? 'Delete' : key,
      handler: () => onKeyPress(key),
    })),
    { key: 'Backspace', handler: () => onKeyPress('⌫') },
    { key: 'Delete', handler: () => onKeyPress('C') },
    { key: '.', handler: () => onKeyPress(',') },
  ];

  useKeyboardShortcut(shortcuts, { disabled: !isModalOpen });

  return (
    <div className={`grid grid-cols-3 gap-1 p-1  mt-2 bg-indigo-100 dark:bg-transparent ${isMobileLandscape ? styles['numeric-keypad-compact'] : ''}`}>
      {KEYPAD_NUMERIC_LAYOUT.flat().map((key) => {
        let buttonClass = " py-2 sm:py-3 text-lg font-medium rounded shadow-sm active:shadow-inner transition-all duration-100 ease-in-out focus:outline-none focus:ring-1 focus:ring-opacity-50  ";

        if (key === '⌫') {
          buttonClass += " bg-slate-400 hover:bg-slate-400 dark:bg-slate-500 dark:hover:bg-slate-400 text-slate-800 dark:text-white focus:ring-slate-400";
        } else if (key === 'C') {
          buttonClass += " bg-red-400 active:bg-red-500 text-white dark:bg-red-400 focus-visible:ring-red-500";
        } else if (key === '') {
          buttonClass += " bg-transparent shadow-none active:shadow-none";
        } else {
          buttonClass += " bg-white hover:bg-slate-50 text-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-white focus:ring-slate-300";
        }
        
        return (
          <button
            key={key}
            onClick={() => onKeyPress(key)}
            className={buttonClass}
            aria-label={key === '⌫' ? 'Retroceso' : key}
            disabled={key === ''}
          >
            {key === '⌫' ? <BackspaceIcon className="w-8 h-8 mx-auto" /> : key}
          </button>
        );
      })}
    </div>
  );
};
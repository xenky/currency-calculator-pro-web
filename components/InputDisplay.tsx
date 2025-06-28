
import React, { useRef, useLayoutEffect } from 'react';
import { BackspaceIcon } from './icons/BackspaceIcon';

interface InputDisplayProps {
  value: string;
  onBackspace: () => void;
}

export const InputDisplay: React.FC<InputDisplayProps> = ({ value, onBackspace }) => {
  const displayFontSize = value.length > 15 ? (value.length > 25 ? 'text-xl' : 'text-2xl') : 'text-4xl';
  const inputRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.scrollLeft = inputRef.current.scrollWidth;
    }
  }, [value]);

  return (
    <div className="flex items-center bg-white dark:bg-slate-600 p-3 rounded-lg shadow">
      <div className="flex-grow overflow-hidden"> {/* Container to manage overflow */}
        <div 
          ref={inputRef}
          className={`text-right text-slate-800 dark:text-white font-mono ${displayFontSize} py-2 overflow-x-auto custom-scrollbar whitespace-nowrap`}
          style={{ direction: 'ltr' }} // Explicitly LTR for typing, text-align handles visual
        >
          {value}
        </div>
      </div>
      <button 
        onClick={onBackspace} 
        className="ml-3 p-3 bg-slate-200 dark:bg-slate-500 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-400 transition-colors"
        aria-label="Retroceso"
      >
        <BackspaceIcon className="w-10 h-10 text-slate-700 dark:text-white" />
      </button>
    </div>
  );
};

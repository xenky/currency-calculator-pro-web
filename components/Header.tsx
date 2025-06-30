
import React from 'react';
import { ActiveView } from '../types';
import { MenuIcon } from './icons/MenuIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface HeaderProps {
  onMenuToggle: () => void;
  activeView: ActiveView;
  headerTitle: string;
  onNavigateBack: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onMenuToggle,
  activeView,
  headerTitle,
  onNavigateBack
}) => {
  return (
    <div className="bg-indigo-600 dark:bg-slate-800 text-white p-3 shadow-md flex-shrink-0">
      <div className="flex justify-between items-center">
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
    </div>
  );
};
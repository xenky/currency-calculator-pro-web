
import React from 'react';
import { AppSettings, ActiveView } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { DarkModeIcon } from './icons/DarkModeIcon';
import { LightModeIcon } from './icons/LightModeIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { InfoIcon } from './icons/InfoIcon';
import { SyncIcon } from './icons/SyncIcon';
import styles from './styles/component.module.css';


interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  appSettings: AppSettings;
  onAppSettingsChange: (settings: AppSettings) => void;
  setActiveView: (view: ActiveView) => void;
  onUpdateRates: () => void;
}

export const Menu: React.FC<MenuProps> = ({ isOpen, onClose, appSettings, onAppSettingsChange, setActiveView, onUpdateRates }) => {
  if (!isOpen) return null;

  const toggleDarkMode = () => {
    onAppSettingsChange({ ...appSettings, darkMode: !appSettings.darkMode });
  };

  const navigateTo = (view: ActiveView) => {
    setActiveView(view);
    onClose();
  };

  const handleUpdateRatesClick = () => {
    onUpdateRates();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40">
      {/* Overlay */}
      <div 
        className={`${styles.menuContainer} absolute inset-0 transition-opacity duration-300 ease-in-out`}
        onClick={onClose}
      ></div>

      {/* Menu Panel */}
      <div className={`fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white dark:bg-slate-800 shadow-xl p-5 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} custom-scrollbar overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">Menú</h2>
          <button onClick={onClose} className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full" aria-label="Cerrar menú">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-2">Tema</h3>
          <button 
            onClick={toggleDarkMode} 
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            aria-label={`Cambiar a modo ${appSettings.darkMode ? 'claro' : 'oscuro'}`}
          >
            <span className="text-slate-700 dark:text-slate-200">{appSettings.darkMode ? 'Modo Oscuro' : 'Modo Claro'}</span>
            {appSettings.darkMode ? <LightModeIcon className="w-5 h-5 text-yellow-400" /> : <DarkModeIcon className="w-5 h-5 text-slate-500" />}
          </button>
        </div>
        
        {/* Navigation Links */}
        <div className="mb-6">
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-2">Secciones</h3>
            <ul className="space-y-2">
                <li>
                    <button 
                        onClick={handleUpdateRatesClick}
                        className="w-full flex items-center px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-slate-700 dark:text-slate-200"
                        aria-label="Actualizar tasas de cambio"
                    >
                        <SyncIcon className="w-5 h-5 mr-3 text-indigo-500 dark:text-indigo-400"/>
                        Actualizar Tasas
                    </button>
                </li>
                <li>
                    <button 
                        onClick={() => navigateTo('history')}
                        className="w-full flex items-center px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-slate-700 dark:text-slate-200"
                        aria-label="Ver historial de operaciones"
                    >
                        <HistoryIcon className="w-5 h-5 mr-3 text-indigo-500 dark:text-indigo-400"/>
                        Ver Historial
                    </button>
                </li>
                <li>
                    <button 
                        onClick={() => navigateTo('about')}
                        className="w-full flex items-center px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-slate-700 dark:text-slate-200"
                        aria-label="Ver información de la aplicación"
                    >
                        <InfoIcon className="w-5 h-5 mr-3 text-indigo-500 dark:text-indigo-400"/>
                        Acerca de
                    </button>
                </li>
            </ul>
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { CheckIcon } from './icons/CheckIcon';

interface InstallPwaPromptProps {
    onInstall: () => void;
    onClose: (dontShowAgain: boolean) => void;
}

export const InstallPwaPrompt: React.FC<InstallPwaPromptProps> = ({ onInstall, onClose }) => {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const handleClose = () => {
        onClose(dontShowAgain);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-sm flex flex-col items-center text-center">
                <DownloadIcon className="w-12 h-12 text-indigo-500 dark:text-indigo-400 mb-4" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Instalar Aplicación</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                    Añade esta aplicación a tu pantalla de inicio para un acceso rápido y funcionamiento sin conexión.
                </p>

                <div className="flex items-center mb-6">
                    <button
                        onClick={() => setDontShowAgain(!dontShowAgain)}
                        className={`w-6 h-6 rounded border-2 transition-all ${dontShowAgain ? 'bg-indigo-600 border-indigo-600' : 'bg-transparent border-slate-400 dark:border-slate-500'}`}
                        aria-checked={dontShowAgain}
                        role="checkbox"
                    >
                        {dontShowAgain && <CheckIcon className="w-4 h-4 text-white mx-auto" />}
                    </button>
                    <label 
                        onClick={() => setDontShowAgain(!dontShowAgain)}
                        className="ml-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                        No volver a mostrar
                    </label>
                </div>
                
                <div className="flex w-full space-x-3">
                    <button 
                        onClick={handleClose} 
                        className="w-full px-4 py-2 rounded bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={onInstall} 
                        className="w-full px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                        Instalar
                    </button>
                </div>
            </div>
        </div>
    );
};
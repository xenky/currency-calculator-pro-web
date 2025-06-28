
import React from 'react';

export const AboutScreen: React.FC = () => {
  return (
    <div className="flex-grow p-4 sm:p-6 bg-slate-100 dark:bg-slate-900 overflow-y-auto custom-scrollbar">
      <div className="max-w-prose mx-auto bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-indigo-700 dark:text-indigo-400 mb-6 text-center">
          Acerca de Calculadora de Divisas Pro
        </h2>
        
        <div className="text-sm sm:text-base text-slate-700 dark:text-slate-300 space-y-4">
          <p className="font-semibold text-lg">Versión: 1.0.0</p>
          <p>Esta aplicación es una calculadora de divisas moderna y fácil de usar, construida con las últimas tecnologías web para ofrecer una experiencia fluida y eficiente.</p>
          
          <div>
            <h3 className="font-semibold text-md text-indigo-600 dark:text-indigo-400 mb-1">Tecnologías Utilizadas:</h3>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>React (para la interfaz de usuario dinámica)</li>
              <li>Tailwind CSS (para un diseño estilizado y responsivo)</li>
              <li>Math.js (para la evaluación de expresiones matemáticas)</li>
              <li>TypeScript (para un desarrollo robusto y tipado)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-md text-indigo-600 dark:text-indigo-400 mb-1">Funcionalidades Destacadas:</h3>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Conversión entre múltiples monedas (VES, COP, USD, EUR).</li>
              <li>Tasas de cambio reales obtenidas desde fuentes oficiales (BCE, BCV, BanRep).</li>
              <li>Opción para establecer tasas de cambio manuales.</li>
              <li>Historial de operaciones.</li>
              <li>Modo claro y oscuro.</li>
              <li>Aplicación Web Progresiva (PWA) con funcionamiento offline.</li>
            </ul>
          </div>
          
          <hr className="my-6 border-slate-300 dark:border-slate-700"/>

          <div>
            <p className="font-medium">Desarrollada con dedicación por:</p>
            <p className="text-lg font-semibold text-indigo-700 dark:text-indigo-400 mt-1">Freddy Rujano</p>
            <p>La Grita - Táchira</p>
            <p>Venezuela</p>
          </div>

          <hr className="my-6 border-slate-300 dark:border-slate-700"/>
          
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-4">
            © 2025 Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

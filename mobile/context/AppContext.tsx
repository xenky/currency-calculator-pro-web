
import React, { createContext, useContext, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AppSettings, HistoryEntry, ExchangeRateState } from '@/types';
import { initialAppSettings, initialExchangeRateState } from '@/constants';

interface AppContextType {
  appSettings: AppSettings;
  setAppSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  history: HistoryEntry[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryEntry[]>>;
  exchangeRateState: ExchangeRateState;
  setExchangeRates: React.Dispatch<React.SetStateAction<ExchangeRateState>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [appSettings, setAppSettings] = useLocalStorage<AppSettings>('appSettings', initialAppSettings);
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('operationHistory', []);
  const [exchangeRateState, setExchangeRates] = useLocalStorage<ExchangeRateState>('exchangeRates', initialExchangeRateState);

  const value = {
    appSettings,
    setAppSettings,
    history,
    setHistory,
    exchangeRateState,
    setExchangeRates,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

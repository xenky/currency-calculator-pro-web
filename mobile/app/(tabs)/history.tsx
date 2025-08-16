import React from 'react';
import { HistoryScreen as HistoryScreenComponent } from '@/components/HistoryScreen';
import { useAppContext } from '@/context/AppContext';

const HistoryScreen = () => {
  const { history, setHistory } = useAppContext();

  const clearHistory = () => {
    setHistory([]);
  };

  return <HistoryScreenComponent history={history} clearHistory={clearHistory} />;
};

export default HistoryScreen;
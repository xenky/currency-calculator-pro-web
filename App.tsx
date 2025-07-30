
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { evaluate } from 'mathjs';
import { Header } from './components/Header';
import { InputDisplay } from './components/InputDisplay';
import { CurrencyOutput } from './components/CurrencyOutput';
import { Keypad } from './components/Keypad';
import { Menu } from './components/Menu';
import { HistoryScreen } from './components/HistoryScreen';
import { AboutScreen } from './components/AboutScreen';
import { Currency, AppSettings, HistoryEntry, ConversionRateInfo, ExchangeRateState, AllExchangeRates, ActiveView, RateEntry } from './types';
import { initialAppSettings, CURRENCIES, initialExchangeRateState } from './constants';
import { formatNumberForDisplay, parseDisplayNumber, fetchOfficialRates, calculateEffectiveValue } from './services/calculatorService';
import { getRateDisplayInfo, applyRateUpdate, getFullRateMatrix, RateMatrix, createOrderedPairKey, parseAndApplyFetchedRates } from './services/exchangeRateService';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useKeyboardShortcut } from './hooks/useKeyboardShortcut';
import { SettingsModal } from './components/SettingsModal';
import { InstallPwaPrompt } from './components/InstallPwaPrompt';
import styles from './components/styles/component.module.css';

const preprocessPercentageExpression = (expression: string): string => {
  return expression.replace(/(\d+(?:\.\d+)?)\s*%\s*(\d+(?:\.\d+)?)/g, '(($1)/100*($2))');
};
let isValueEqual = false;
let isOperationNew = false;

const App: React.FC = () => {
  const [input, setInput] = useState<string>('0');
  const [activeInputCurrency, setActiveInputCurrency] = useLocalStorage<Currency>('activeInputCurrency', 'VES');

  const [appSettings, setAppSettings] = useLocalStorage<AppSettings>('appSettings', initialAppSettings);
  const [exchangeRateState, setExchangeRates] = useLocalStorage<ExchangeRateState>('exchangeRates', () => {
    const storedItem = localStorage.getItem('exchangeRates');
    if (storedItem) {
      try {
        const parsed = JSON.parse(storedItem);
        if (parsed && typeof parsed.officialRates === 'object' && typeof parsed.manualRates === 'object') {
          return {
            ...initialExchangeRateState, // Start with defaults
            ...parsed, // Override with stored values
            preferredRateTypes: parsed.preferredRateTypes || {},
          };
        }
      } catch (e) {
        console.warn("Failed to parse exchange rates from localStorage, using initial values.", e);
      }
    }
    return initialExchangeRateState;
  });
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('operationHistory', []);

  const [activeView, setActiveView] = useState<ActiveView>('calculator');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false);

  const [installPromptEvent, setInstallPromptEvent] = useState<Event | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState<boolean>(false);

  const activeRateData = useMemo(() => {
    const rates: AllExchangeRates = {};
    const allKnownPairs = new Set([
      ...Object.keys(exchangeRateState.officialRates),
      ...Object.keys(exchangeRateState.manualRates)
    ]);

    for (const pairKey of allKnownPairs) {
      const preferredType = exchangeRateState.preferredRateTypes[pairKey];
      const manualRate = exchangeRateState.manualRates[pairKey];
      const officialRate = exchangeRateState.officialRates[pairKey];

      let rateToUse: RateEntry | undefined = undefined;

      if (preferredType === 'manual' && manualRate) {
        rateToUse = manualRate;
      } else if (preferredType === 'oficial') {
        rateToUse = officialRate;
      } else {
        rateToUse = manualRate || officialRate;
      }

      if (rateToUse) {
        rates[pairKey] = rateToUse;
      }
    }
    return rates;
  }, [exchangeRateState.officialRates, exchangeRateState.manualRates, exchangeRateState.preferredRateTypes]);

  const [rateMatrix, setRateMatrix] = useState<RateMatrix>(() => getFullRateMatrix(activeRateData, exchangeRateState.officialRates));
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [editingRateModalParams, setEditingRateModalParams] = useState<{ modalForInputCurrency: Currency, modalForOutputCurrency: Currency } | null>(null);
  const [lastValidResult, setLastValidResult] = useState<number>(0);
  const [ratesLastUpdateDate, setRatesLastUpdateDate] = useState<string | null>(null);
  const [isMobileLandscape, setIsMobileLandscape] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = Math.min(window.innerWidth, window.innerHeight) <= 768; // Define mobile based on the smaller dimension
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;
      setIsMobileLandscape(isMobile && isLandscape);
    };

    checkOrientation(); // Initial check
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);


  useEffect(() => {
    setRateMatrix(getFullRateMatrix(activeRateData, exchangeRateState.officialRates));
  }, [activeRateData, exchangeRateState.officialRates]);

  useEffect(() => {
    if (appSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appSettings.darkMode]);

  useEffect(() => {
    const lockOrientation = async () => {
      try {
        if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
          await window.screen.orientation.lock('portrait');
        }
      } catch (error) {
        console.warn('No se pudo bloquear la orientación a vertical:', error);
      }
    };

    // Solo intentar bloquear en dispositivos que parecen ser móviles
    if (window.innerWidth < 768) {
      lockOrientation();
    }
  }, []);

  const fetchAndUpdateCloudRates = useCallback(async () => {
    try {
      const cloudData = await fetchOfficialRates();
      console.log('New rates fetched, updating state...');
      setRatesLastUpdateDate(cloudData.date);
      setExchangeRates(prev => {
        const updatedOfficialRates = parseAndApplyFetchedRates(cloudData, prev.officialRates);
        return { ...prev, officialRates: updatedOfficialRates, lastCloudFetchDate: cloudData.date };
      });
      return true; // Indicate success for notification handling
    } catch (error) {
      console.error("Failed to fetch or process official rates:", error);
      return false; // Indicate failure
    }
  }, [setExchangeRates]);

  const handleManualRateUpdate = useCallback(async () => {
    const success = await fetchAndUpdateCloudRates();
    if (success) {
      setIsUpdateAvailable(true);
      setTimeout(() => setIsUpdateAvailable(false), 4000);
    }
  }, [fetchAndUpdateCloudRates]);



  const addToHistory = useCallback((expression: string, rawResult: number) => {
    const effectiveResult = calculateEffectiveValue(rawResult, activeInputCurrency, appSettings);

    const allResults: Record<Currency, number> = {} as Record<Currency, number>;

    CURRENCIES.forEach(currency => {
      if (currency === activeInputCurrency) {
        allResults[currency] = effectiveResult;
      } else if (rateMatrix[activeInputCurrency] && rateMatrix[activeInputCurrency][currency]) {
        const multiplier = rateMatrix[activeInputCurrency][currency].value;
        if (multiplier && isFinite(effectiveResult)) {
          allResults[currency] = effectiveResult * multiplier;
        } else {
          allResults[currency] = 0;
        }
      } else {
        allResults[currency] = 0;
      }
    });

    const newEntry: HistoryEntry = {
      id: Date.now(),
      expression: expression,
      results: allResults,
      inputCurrency: activeInputCurrency,
      timestamp: new Date().toISOString(),
    };
    setHistory(prev => [newEntry, ...prev.slice(0, 49)]);
    isValueEqual = true;
    isOperationNew = true;
  }, [activeInputCurrency, appSettings, rateMatrix, setHistory]);
  useEffect(() => {
    // Initial fetch on app load (silently)
    fetchAndUpdateCloudRates();

    const handleSWMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'RATES_UPDATED') {
        console.log('App received RATES_UPDATED message from SW. Refetching silently...');
        fetchAndUpdateCloudRates();
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleSWMessage);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const dontShowAgain = localStorage.getItem('dontShowInstallPrompt');
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (!dontShowAgain && !isStandalone) {
        setInstallPromptEvent(e);
        setShowInstallPrompt(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [fetchAndUpdateCloudRates]);

  const handleInstall = () => {
    if (!installPromptEvent || !(installPromptEvent as any).prompt) return;
    (installPromptEvent as any).prompt();
    (installPromptEvent as any).userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      setInstallPromptEvent(null);
      setShowInstallPrompt(false);
    });
  };

  const handleCloseInstallPrompt = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem('dontShowInstallPrompt', 'true');
    }
    setShowInstallPrompt(false);
  };

  const handleKeypadPress = (key: string) => {
    const lastChar = input[input.length - 1];
    const operators = ['+', '-', '*', '/', '%'];


    if (key === 'C') {
      setInput('0');
      setLastValidResult(0);
    } else if (key === '-' && input === '0') {
      setInput(key);
      isValueEqual = false;
    } else if (key === '-' && lastChar === '(') {
      setInput(input + key);
    } else if (key === '=') {
      if (input === 'Error' || operators.includes(lastChar) || lastChar === '(' || input.endsWith(',') || isValueEqual) {
        return;
      }
      try {
        let sanitizedInput = input.replace(/\./g, '').replace(/,/g, '.');
        sanitizedInput = preprocessPercentageExpression(sanitizedInput);
        const result = evaluate(sanitizedInput);
        const formattedResult = formatNumberForDisplay(result, 2, true);
        setInput(formattedResult);
        const newResultValue = Number(parseDisplayNumber(formattedResult));
        setLastValidResult(newResultValue);
        addToHistory(input, newResultValue);
      } catch (e) {
        setInput('Error');
        setLastValidResult(0);
      }
    } else if (key === '⌫') {
      if (input.length > 1 && input !== 'Error') {
        setInput(input.slice(0, -1));
        isValueEqual = false;
      } else {
        setInput('0');
      }
    } else if (input === 'Error') {
      setInput(key === ',' ? '0,' : key);
    } else if (operators.includes(key)) {
      if (input === '0' && key !== '-' && key !== '%') {
        return;
      }
      if (operators.includes(lastChar)) {
        if (lastChar === '-' && input.length === 1 || lastChar === '-' && input[input.length - 2] === '(') {
          return;
        } else {  
          setInput(input.slice(0, -1) + key);
        }
      } else if (lastChar !== '(' && !input.endsWith(',')) {
        setInput(input + key);
        isValueEqual = false;
      }
    } else if (key === ',') {
      const segments = input.split(/[+\-*/%()]/);
      const currentNumberSegment = segments.pop() || "";
      if (!currentNumberSegment.includes(',') && (/\d$/.test(lastChar) || input === '0')) {
        setInput(input + ',');
      } else if (input === "") {
        setInput('0,');
      }
    } else if (key === '( )') {
      const openParenCount = (input.match(/\(/g) || []).length;
      const closeParenCount = (input.match(/\)/g) || []).length;
      if (input === '0') {
        setInput('(');
        isOperationNew = false;
      } else if (openParenCount > closeParenCount && (/\d$/.test(lastChar) || lastChar === ')')) {
        setInput(input + ')');
      } else if (/\d$/.test(lastChar) || lastChar === ')') {
        setInput(input + '*(');
        isOperationNew = false;
      } else if (operators.includes(lastChar)) {
        setInput(input + '(');
        isOperationNew = false;
      }
    } else {
      if (input === '0') {
        setInput(key);
        isValueEqual = false;
      } else if (lastChar === ')') {
        setInput(input + '*' + key);
      } else if (isValueEqual && isOperationNew) {
        setInput('' + key);
        isOperationNew = false;
        isValueEqual = false;
      } else {
        setInput(input + key);
        isValueEqual = false;
      }
    }
  };


  useEffect(() => {
    if (input === 'Error' || input === '' || input.endsWith(',')) {
      return;
    }
    const lastChar = input[input.length - 1];
    if (['+', '-', '*', '/', '%', '('].includes(lastChar)) {
      const evalInputBeforeOperator = input.slice(0, -1);
      if (evalInputBeforeOperator === "" || ['+', '-', '*', '/', '%', '('].includes(evalInputBeforeOperator[evalInputBeforeOperator.length - 1])) {
        return;
      }
      try {
        let sanitizedInputBeforeOperator = evalInputBeforeOperator.replace(/\./g, '').replace(/,/g, '.');
        sanitizedInputBeforeOperator = preprocessPercentageExpression(sanitizedInputBeforeOperator);
        const result = evaluate(sanitizedInputBeforeOperator);
        if (!isNaN(result) && isFinite(result)) {
          setLastValidResult(result);
        }
      } catch (e) { /* Keep last valid result if intermediate step is bad */ }
      return;
    }

    try {
      let sanitizedInput = input.replace(/\./g, '').replace(/,/g, '.');
      sanitizedInput = preprocessPercentageExpression(sanitizedInput);
      const result = evaluate(sanitizedInput);
      if (!isNaN(result) && isFinite(result)) {
        setLastValidResult(result);
      }
    } catch (e) { /* Keep last valid result if current input is invalid */ }
  }, [input]);

  const handleOpenSettings = (outputCurrency: Currency) => {
    if (outputCurrency === activeInputCurrency) return;
    setEditingRateModalParams({ modalForInputCurrency: activeInputCurrency, modalForOutputCurrency: outputCurrency });
    setIsSettingsModalOpen(true);
  };

  const handleSaveManualRate = (from: Currency, to: Currency, newRateValue: number) => {
    setExchangeRates(prev => {
      const updatedManualRates = applyRateUpdate(prev.manualRates, from, to, newRateValue, 'Manual');
      return { ...prev, manualRates: updatedManualRates };
    });
  };

  const handleSetPreferredRateType = (pairKey: string, type: 'oficial' | 'manual') => {
    setExchangeRates(prev => ({
      ...prev,
      preferredRateTypes: {
        ...prev.preferredRateTypes,
        [pairKey]: type,
      },
    }));
  };

  useKeyboardShortcut([
    { key: 'b', handler: () => setActiveInputCurrency('VES') },
    { key: 'p', handler: () => setActiveInputCurrency('COP') },
    { key: 'd', handler: () => setActiveInputCurrency('USD') },
    { key: 'e', handler: () => setActiveInputCurrency('EUR') },
    { key: 'b', ctrlKey: true, handler: () => handleOpenSettings('VES') },
    { key: 'p', ctrlKey: true, handler: () => handleOpenSettings('COP') },
    { key: 'd', ctrlKey: true, handler: () => handleOpenSettings('USD') },
    { key: 'e', ctrlKey: true, handler: () => handleOpenSettings('EUR') },
  ], { disabled: isSettingsModalOpen });

  const evaluationResultForDisplay = lastValidResult;
  const effectiveEvaluationResult = calculateEffectiveValue(evaluationResultForDisplay, activeInputCurrency, appSettings);

  let headerTitle = "Calculadora de Divisas";
  if (activeView === 'history') headerTitle = "Historial de Operaciones";
  else if (activeView === 'about') headerTitle = "Acerca de la Aplicación";

  const renderCalculatorView = () => {
    const containerClasses = `flex flex-col flex-grow  overflow-hidden ${isMobileLandscape ? styles['landscape-container'] : 'mt-1'}`;
    const currencyOutputWrapperClasses = isMobileLandscape ? 'grid grid-cols-1  h-full overflow-y-auto' : 'flex flex-col flex-shrink-0 mx-2 mb-1';
    const keypadWrapperClasses = isMobileLandscape ? '' : 'mx-2 mb-2 grid h-full pb-[env(safe-area-inset-bottom)]';

    return (
      <div className= {containerClasses} >
        <div className={`${isMobileLandscape ? styles['currency-output-landscape'] : ''} ${currencyOutputWrapperClasses} `}>
          {CURRENCIES.map(currency => {
            let displayValue: number | null = null;
            let rateDisplayInfo: ConversionRateInfo | null = null;

            if (rateMatrix[activeInputCurrency] && rateMatrix[activeInputCurrency][currency]) {
              const multiplier = rateMatrix[activeInputCurrency][currency].value;
              if (multiplier && typeof effectiveEvaluationResult === 'number' && isFinite(effectiveEvaluationResult)) {
                displayValue = effectiveEvaluationResult * multiplier;
              }
              rateDisplayInfo = getRateDisplayInfo(activeInputCurrency, currency, activeRateData, rateMatrix);
            }

            if (currency === activeInputCurrency) {
              displayValue = effectiveEvaluationResult;
              rateDisplayInfo = {
                pair: `${currency}/${currency}`,
                value: 1,
                source: 'System',
                isDirect: true,
              };
            }

            const isInput = currency === activeInputCurrency;

            return (
              <CurrencyOutput
                key={currency}
                currency={currency}
                value={isInput ? lastValidResult : displayValue}
                rateInfo={rateDisplayInfo}
                onSettingsClick={() => handleOpenSettings(currency)}
                isInputCurrency={isInput}
                onCurrencySelect={setActiveInputCurrency}
                inputDisplayComponent={
                  isInput ? (
                    <InputDisplay
                      value={input}
                      activeInputCurrency={activeInputCurrency}
                      evaluationResult={lastValidResult}
                    />
                  ) : undefined
                }
                isMobileLandscape={isMobileLandscape}
              />
            );
          })}
        </div>

        <div className={`${isMobileLandscape ? styles['keypad-landscape'] : ''} ${keypadWrapperClasses}`}>
          <Keypad onKeyPress={handleKeypadPress} isModalOpen={isSettingsModalOpen} />
        </div>
      </div>
    );
  };

  return (
    <div className={`relative flex flex-col h-screen max-w-md mx-auto bg-slate-200 dark:bg-slate-900 shadow-lg font-sans ${isMobileLandscape ? styles['app-full-width-landscape'] : ''}`}>
      {isUpdateAvailable && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300">
          Tasas de cambio actualizadas.
        </div>
      )}
      <Header
        onMenuToggle={() => setIsMenuOpen(true)}
        activeView={activeView}
        headerTitle={headerTitle}
        onNavigateBack={() => setActiveView('calculator')}
      />

      <div className="flex flex-col flex-grow overflow-hidden mt-1">
        {activeView === 'calculator' && renderCalculatorView()}
        {activeView === 'history' && <HistoryScreen history={history} clearHistory={() => setHistory([])} />}
        {activeView === 'about' && <AboutScreen />}
      </div>

      <Menu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        appSettings={appSettings}
        onAppSettingsChange={setAppSettings}
        setActiveView={setActiveView}
        onUpdateRates={handleManualRateUpdate}
      />

      {isSettingsModalOpen && editingRateModalParams && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          modalForInputCurrency={editingRateModalParams.modalForInputCurrency}
          modalForOutputCurrency={editingRateModalParams.modalForOutputCurrency}
          officialRatesData={exchangeRateState.officialRates}
          manualRatesData={exchangeRateState.manualRates}
          preferredRateTypes={exchangeRateState.preferredRateTypes}
          rateMatrix={rateMatrix}
          onSaveManualRate={handleSaveManualRate}
          onSetPreferredRateType={handleSetPreferredRateType}
          appSettings={appSettings}
          onAppSettingsChange={setAppSettings}
          lastUpdateDate={ratesLastUpdateDate}
          isMobileLandscape={isMobileLandscape}
        />
      )}

      {showInstallPrompt && (
        <InstallPwaPrompt
          onInstall={handleInstall}
          onClose={handleCloseInstallPrompt}
        />
      )}
    </div>
  );
};

export default App;

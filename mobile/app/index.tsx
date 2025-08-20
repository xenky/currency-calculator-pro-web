import { evaluate } from "mathjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  useColorScheme,
} from "react-native";
import { AboutScreen } from "../components/AboutScreen";
import { CurrencyOutput } from "../components/CurrencyOutput";
import { Header } from "../components/Header";
import { HistoryScreen } from "../components/HistoryScreen";
import { InputDisplay } from "../components/InputDisplay";
import { Keypad } from "../components/Keypad";
import { Menu } from "../components/Menu";
import { SettingsModal } from "../components/SettingsModal";
import {
  CURRENCIES,
  initialAppSettings,
  initialExchangeRateState,
} from "../constants";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  calculateEffectiveValue,
  fetchOfficialRates,
  formatNumberForDisplay,
  parseDisplayNumber,
} from "../services/calculatorService";
import {
  applyRateUpdate,
  getFullRateMatrix,
  getRateDisplayInfo,
  parseAndApplyFetchedRates,
  RateMatrix,
} from "../services/exchangeRateService";
import {
  ActiveView,
  AllExchangeRates,
  AppSettings,
  ConversionRateInfo,
  Currency,
  ExchangeRateState,
  HistoryEntry,
  RateEntry,
} from "../types";

const preprocessPercentageExpression = (expression: string): string => {
  return expression.replace(
    /(\d+(?:\.\d+)?)\s*%\s*(\d+(?:\.\d+)?)/g,
    "(($1)/100*($2))"
  );
};
let isValueEqual = false;
let isOperationNew = false;

const App: React.FC = () => {
  const [input, setInput] = useState<string>("0");
  const [activeInputCurrency, setActiveInputCurrency] =
    useLocalStorage<Currency>("activeInputCurrency", "VES");

  const [appSettings, setAppSettings] = useLocalStorage<AppSettings>(
    "appSettings",
    initialAppSettings
  );
  const [exchangeRateState, setExchangeRates] =
    useLocalStorage<ExchangeRateState>("exchangeRates", initialExchangeRateState);
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>(
    "operationHistory",
    []
  );

  const [activeView, setActiveView] = useState<ActiveView>("calculator");
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false);

  const activeRateData = useMemo(() => {
    const rates: AllExchangeRates = {};
    const allKnownPairs = new Set([
      ...Object.keys(exchangeRateState.officialRates),
      ...Object.keys(exchangeRateState.manualRates),
    ]);

    for (const pairKey of allKnownPairs) {
      const preferredType = exchangeRateState.preferredRateTypes[pairKey];
      const manualRate = exchangeRateState.manualRates[pairKey];
      const officialRate = exchangeRateState.officialRates[pairKey];

      let rateToUse: RateEntry | undefined = undefined;

      if (preferredType === "manual" && manualRate) {
        rateToUse = manualRate;
      } else if (preferredType === "oficial") {
        rateToUse = officialRate;
      } else {
        rateToUse = manualRate || officialRate;
      }

      if (rateToUse) {
        rates[pairKey] = rateToUse;
      }
    }
    return rates;
  }, [
    exchangeRateState.officialRates,
    exchangeRateState.manualRates,
    exchangeRateState.preferredRateTypes,
  ]);

  const [rateMatrix, setRateMatrix] = useState<RateMatrix>(() =>
    getFullRateMatrix(activeRateData, exchangeRateState.officialRates)
  );
  const [isSettingsModalOpen, setIsSettingsModalOpen] =
    useState<boolean>(false);
  const [editingRateModalParams, setEditingRateModalParams] = useState<{
    modalForInputCurrency: Currency;
    modalForOutputCurrency: Currency;
  } | null>(null);
  const [lastValidResult, setLastValidResult] = useState<number>(0);
  const [ratesLastUpdateDate, setRatesLastUpdateDate] = useState<string | null>(
    null
  );

  useEffect(() => {
    setRateMatrix(
      getFullRateMatrix(activeRateData, exchangeRateState.officialRates)
    );
  }, [activeRateData, exchangeRateState.officialRates]);

  const fetchAndUpdateCloudRates = useCallback(async () => {
    try {
      const cloudData = await fetchOfficialRates();
      console.log("New rates fetched, updating state...");
      setRatesLastUpdateDate(cloudData.date);
      setExchangeRates((prev) => {
        const updatedOfficialRates = parseAndApplyFetchedRates(
          cloudData,
          prev.officialRates
        );
        return {
          ...prev,
          officialRates: updatedOfficialRates,
          lastCloudFetchDate: cloudData.date,
        };
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

  const addToHistory = useCallback(
    (expression: string, rawResult: number) => {
      const effectiveResult = calculateEffectiveValue(
        rawResult,
        activeInputCurrency,
        appSettings
      );

      const allResults: Record<Currency, number> = {} as Record<
        Currency,
        number
      >;

      CURRENCIES.forEach((currency) => {
        if (currency === activeInputCurrency) {
          allResults[currency] = effectiveResult;
        } else if (
          rateMatrix[activeInputCurrency] &&
          rateMatrix[activeInputCurrency][currency]
        ) {
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
      setHistory((prev) => [newEntry, ...prev.slice(0, 49)]);
      isValueEqual = true;
      isOperationNew = true;
    },
    [activeInputCurrency, appSettings, rateMatrix, setHistory]
  );

  useEffect(() => {
    // Initial fetch on app load
    fetchAndUpdateCloudRates();

    // Set up hourly fetching
    const intervalId = setInterval(() => {
      console.log("Performing scheduled hourly rate update...");
      fetchAndUpdateCloudRates();
    }, 3600000); // 1 hour in milliseconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchAndUpdateCloudRates]);

  const handleKeypadPress = (key: string) => {
    const lastChar = input[input.length - 1];
    const operators = ["+", "-", "*", "/", "%"];

    if (key === "C") {
      setInput("0");
      setLastValidResult(0);
    } else if (key === "-" && input === "0") {
      setInput(key);
      isValueEqual = false;
    } else if (key === "-" && lastChar === "(") {
      setInput(input + key);
    } else if (key === "=") {
      if (
        input === "Error" ||
        operators.includes(lastChar) ||
        lastChar === "(" ||
        input.endsWith(",") ||
        isValueEqual
      ) {
        return;
      }
      try {
        let sanitizedInput = input.replace(/\./g, "").replace(/,/g, ".");
        sanitizedInput = preprocessPercentageExpression(sanitizedInput);
        const result = evaluate(sanitizedInput);
        const formattedResult = formatNumberForDisplay(result, 2, true);
        setInput(formattedResult);
        const newResultValue = Number(parseDisplayNumber(formattedResult));
        setLastValidResult(newResultValue);
        addToHistory(input, newResultValue);
      } catch (e) {
        setInput("Error");
        setLastValidResult(0);
      }
    } else if (key === "⌫") {
      if (input.length > 1 && input !== "Error") {
        setInput(input.slice(0, -1));
        isValueEqual = false;
      } else {
        setInput("0");
      }
    } else if (input === "Error") {
      setInput(key === "," ? "0," : key);
    } else if (operators.includes(key)) {
      if (input === "0" && key !== "-" && key !== "%") {
        return;
      }
      if (operators.includes(lastChar)) {
        if (
          (lastChar === "-" && input.length === 1) ||
          (lastChar === "-" && input[input.length - 2] === "(")
        ) {
          return;
        } else {
          setInput(input.slice(0, -1) + key);
        }
      } else if (lastChar !== "(" && !input.endsWith(",")) {
        setInput(input + key);
        isValueEqual = false;
      }
    } else if (key === ",") {
      const segments = input.split(/[+\-*/%()]/);
      const currentNumberSegment = segments.pop() || "";
      if (
        !currentNumberSegment.includes(",") &&
        (/\d$/.test(lastChar) || input === "0")
      ) {
        setInput(input + ",");
      } else if (input === "") {
        setInput("0,");
      }
    } else if (key === "( )") {
      const openParenCount = (input.match(/\(/g) || []).length;
      const closeParenCount = (input.match(/\)/g) || []).length;
      if (input === "0") {
        setInput("(");
        isOperationNew = false;
      } else if (
        openParenCount > closeParenCount &&
        (/\d$/.test(lastChar) || lastChar === ")")
      ) {
        setInput(input + ")");
      } else if (/\d$/.test(lastChar) || lastChar === ")") {
        setInput(input + "*(");
        isOperationNew = false;
      } else if (operators.includes(lastChar)) {
        setInput(input + "(");
        isOperationNew = false;
      }
    } else {
      if (input === "0") {
        setInput(key);
        isValueEqual = false;
      } else if (lastChar === ")") {
        setInput(input + "*" + key);
      } else if (isValueEqual && isOperationNew) {
        setInput("" + key);
        isOperationNew = false;
        isValueEqual = false;
      } else {
        setInput(input + key);
        isValueEqual = false;
      }
    }
  };

  useEffect(() => {
    if (input === "Error" || input === "" || input.endsWith(",")) {
      return;
    }
    const lastChar = input[input.length - 1];
    if (["+", "-", "*", "/", "%", "("].includes(lastChar)) {
      const evalInputBeforeOperator = input.slice(0, -1);
      if (
        evalInputBeforeOperator === "" ||
        ["+", "-", "*", "/", "%", "("].includes(
          evalInputBeforeOperator[evalInputBeforeOperator.length - 1]
        )
      ) {
        return;
      }
      try {
        let sanitizedInputBeforeOperator = evalInputBeforeOperator
          .replace(/\./g, "")
          .replace(/,/g, ".");
        sanitizedInputBeforeOperator = preprocessPercentageExpression(
          sanitizedInputBeforeOperator
        );
        const result = evaluate(sanitizedInputBeforeOperator);
        if (!isNaN(result) && isFinite(result)) {
          setLastValidResult(result);
        }
      } catch (e) {
        /* Keep last valid result if intermediate step is bad */
      }
      return;
    }

    try {
      let sanitizedInput = input.replace(/\./g, "").replace(/,/g, ".");
      sanitizedInput = preprocessPercentageExpression(sanitizedInput);
      const result = evaluate(sanitizedInput);
      if (!isNaN(result) && isFinite(result)) {
        setLastValidResult(result);
      }
    } catch (e) {
      /* Keep last valid result if current input is invalid */
    }
  }, [input]);

  const handleOpenSettings = (outputCurrency: Currency) => {
    if (outputCurrency === activeInputCurrency) return;
    setEditingRateModalParams({
      modalForInputCurrency: activeInputCurrency,
      modalForOutputCurrency: outputCurrency,
    });
    setIsSettingsModalOpen(true);
  };

  const handleSaveManualRate = (
    from: Currency,
    to: Currency,
    newRateValue: number
  ) => {
    setExchangeRates((prev) => {
      const updatedManualRates = applyRateUpdate(
        prev.manualRates,
        from,
        to,
        newRateValue,
        "Manual"
      );
      return { ...prev, manualRates: updatedManualRates };
    });
  };

  const handleSetPreferredRateType = (
    pairKey: string,
    type: "oficial" | "manual"
  ) => {
    setExchangeRates((prev) => ({
      ...prev,
      preferredRateTypes: {
        ...prev.preferredRateTypes,
        [pairKey]: type,
      },
    }));
  };

  const evaluationResultForDisplay = lastValidResult;
  const effectiveEvaluationResult = calculateEffectiveValue(
    evaluationResultForDisplay,
    activeInputCurrency,
    appSettings
  );

  let headerTitle = "Calculadora de Divisas";
  if (activeView === "history") headerTitle = "Historial de Operaciones";
  else if (activeView === "about") headerTitle = "Acerca de la Aplicación";

  const renderCalculatorView = () => {
    return (
      <View style={styles.calculatorContainer}>
        <View style={styles.currencyOutputWrapper}>
          {CURRENCIES.map((currency) => {
            let displayValue: number | null = null;
            let rateDisplayInfo: ConversionRateInfo | null = null;

            if (
              rateMatrix[activeInputCurrency] &&
              rateMatrix[activeInputCurrency][currency]
            ) {
              const multiplier =
                rateMatrix[activeInputCurrency][currency].value;
              if (
                multiplier &&
                typeof effectiveEvaluationResult === "number" &&
                isFinite(effectiveEvaluationResult)
              ) {
                displayValue = effectiveEvaluationResult * multiplier;
              }
              rateDisplayInfo = getRateDisplayInfo(
                activeInputCurrency,
                currency,
                activeRateData,
                rateMatrix
              );
            }

            if (currency === activeInputCurrency) {
              displayValue = effectiveEvaluationResult;
              rateDisplayInfo = {
                pair: `${currency}/${currency}`,
                value: 1,
                source: "System",
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
              />
            );
          })}
        </View>

        <View style={styles.keypadWrapper}>
          <Keypad
            onKeyPress={handleKeypadPress}
            isModalOpen={isSettingsModalOpen}
          />
        </View>
      </View>
    );
  };

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDarkMode ? styles.containerDark : {}]}>
      {isUpdateAvailable && (
        <View style={styles.updateNotificationContainer}>
          <Text style={styles.updateNotificationText}>
            Tasas de cambio actualizadas.
          </Text>
        </View>
      )}

      <Header
        onMenuToggle={() => setIsMenuOpen(true)}
        activeView={activeView}
        headerTitle={headerTitle}
        onNavigateBack={() => setActiveView("calculator")}
      />

      <View style={styles.contentContainer}>
        {activeView === "calculator" && renderCalculatorView()}
        {activeView === "history" && (
          <HistoryScreen
            history={history}
            clearHistory={() => setHistory([])}
          />
        )}
        {activeView === "about" && <AboutScreen />}
      </View>

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
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  containerDark: {
    backgroundColor: "#0f172a", // Adjust to your dark mode background
  },
  updateNotificationContainer: {
    backgroundColor: '#22c55e', // green-500
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    position: 'absolute',
    top: 40, // Adjust as needed
    left: '25%',
    right: '25%',
    zIndex: 50,
    alignItems: 'center',
  },
  updateNotificationText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    flexDirection: "column",
    overflow: "hidden",
    marginTop: 4,
  },
  calculatorContainer: {
    flex: 1,
    flexDirection: "column",
  },
  currencyOutputWrapper: {
    /* flex: 1, */
  },
  keypadWrapper: {
    flex: 1,
  },
});

export default App;

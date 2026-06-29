import { evaluate } from "mathjs";
import React, { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
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
} from "../constants";
import {
  getRateDisplayInfo,
} from "../services/exchangeRateService";
import { useAppContext } from "../context/AppContext";

const preprocessPercentageExpression = (expression: string): string => {
  return expression.replace(
    /(\d+(?:\.\d+)?)\s*%\s*(\d+(?:\.\d+)?)/g,
    "(($1)/100*($2))"
  );
};
let isValueEqual = false;
let isOperationNew = false;

const App: React.FC = () => {
  const {
    input,
    setInput,
    activeInputCurrency,
    setActiveInputCurrency,
    appSettings,
    setAppSettings,
    exchangeRateState,
    setExchangeRates,
    history,
    setHistory,
    activeView,
    setActiveView,
    isMenuOpen,
    setIsMenuOpen,
    isUpdateAvailable,
    setIsUpdateAvailable,
    activeRateData,
    rateMatrix,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    editingRateModalParams,
    setEditingRateModalParams,
    lastValidResult,
    setLastValidResult,
    ratesLastUpdateDate,
    isDarkMode,
    headerTitle,
    handleKeypadPress,
    handleOpenSettings,
    handleSaveManualRate,
    handleSetPreferredRateType,
    handleManualRateUpdate,
    clearHistory,
    onNavigateBack,
  } = useAppContext();

  // The following useEffect and handleKeypadPress logic remains here
  // as it's tightly coupled with the calculator's input state.
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_e) {
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
    } catch (_e) {
      /* Keep last valid result if current input is invalid */
    }
  }, [input, setLastValidResult]);

  const styles = StyleSheet.create({
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
    flex: 1,
  },
  keypadWrapper: {
    height: '60%',
  },
});

  const renderCalculatorView = () => {
    return (
      <View style={styles.calculatorContainer}>
        <ScrollView style={styles.currencyOutputWrapper}>
          {CURRENCIES.map((currency) => {
            let displayValue: number | null = null;
            let rateDisplayInfo: any | null = null; // Changed to any for now

            if (
              rateMatrix[activeInputCurrency] &&
              rateMatrix[activeInputCurrency][currency]
            ) {
              const multiplier =
                rateMatrix[activeInputCurrency][currency].value;
              if (
                multiplier &&
                typeof lastValidResult === "number" &&
                isFinite(lastValidResult)
              ) {
                displayValue = lastValidResult * multiplier;
              }
              rateDisplayInfo = getRateDisplayInfo(
                activeInputCurrency,
                currency,
                activeRateData,
                rateMatrix
              );
            }

            if (currency === activeInputCurrency) {
              displayValue = lastValidResult;
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
                isDarkMode={isDarkMode} // Pass down the correct theme status
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
        </ScrollView>

        <View style={styles.keypadWrapper}>
          <Keypad
            onKeyPress={handleKeypadPress}
            isModalOpen={isSettingsModalOpen}
            isDarkMode={isDarkMode}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? '#0f172a' : '#f0f0f0' }}>
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
        onNavigateBack={onNavigateBack}
      />

      <View style={styles.contentContainer}>
        {activeView === "calculator" && renderCalculatorView()}
        {activeView === "history" && (
          <HistoryScreen
            history={history}
            clearHistory={clearHistory}
            isDarkMode={isDarkMode}
          />
        )}
        {activeView === "about" && <AboutScreen isDarkMode={isDarkMode} />}
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
      
    </View>
  );
};

export default App;
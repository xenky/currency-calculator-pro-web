
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { evaluate } from 'mathjs';
import { useRouter } from 'expo-router';
import { Header } from '@/components/Header';
import { InputDisplay } from '@/components/InputDisplay';
import { CurrencyOutput } from '@/components/CurrencyOutput';
import { Keypad } from '@/components/Keypad';
import { Currency, HistoryEntry, ConversionRateInfo, AllExchangeRates, RateEntry } from '@/types';
import { CURRENCIES } from '@/constants';
import { formatNumberForDisplay, parseDisplayNumber, fetchOfficialRates, calculateEffectiveValue } from '@/services/calculatorService';
import { getRateDisplayInfo, getFullRateMatrix, RateMatrix, parseAndApplyFetchedRates } from '@/services/exchangeRateService';
import { useAppContext } from '@/context/AppContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const preprocessPercentageExpression = (expression: string): string => {
  return expression.replace(/(\d+(?:\.\d+)?)\s*%\s*(\d+(?:\.\d+)?)/g, '(($1)/100*($2))');
};
let isValueEqual = false;
let isOperationNew = false;

const CalculatorScreen: React.FC = () => {
  const { appSettings, exchangeRateState, setExchangeRates, setHistory } = useAppContext();
  const [input, setInput] = useState<string>('0');
  const [activeInputCurrency, setActiveInputCurrency] = useLocalStorage<Currency>('activeInputCurrency', 'VES');
  const router = useRouter();
  
  const activeRateData = useMemo(() => {
    const rates: AllExchangeRates = {};
    const officialRates = exchangeRateState.officialRates || {};
    const manualRates = exchangeRateState.manualRates || {};
    const allKnownPairs = new Set([
      ...Object.keys(officialRates),
      ...Object.keys(manualRates)
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
  const [lastValidResult, setLastValidResult] = useState<number>(0);

  useEffect(() => {
    setRateMatrix(getFullRateMatrix(activeRateData, exchangeRateState.officialRates));
  }, [activeRateData, exchangeRateState.officialRates]);

  const fetchAndUpdateCloudRates = useCallback(async () => {
    try {
      const cloudData = await fetchOfficialRates();
      setExchangeRates(prev => {
        const updatedOfficialRates = parseAndApplyFetchedRates(cloudData, prev.officialRates);
        return { ...prev, officialRates: updatedOfficialRates, lastCloudFetchDate: cloudData.date };
      });
    } catch (error) {
      console.error("Failed to fetch or process official rates:", error);
    }
  }, [setExchangeRates]);

  useEffect(() => {
    fetchAndUpdateCloudRates();
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
    router.push({ pathname: '/settings', params: { modalForInputCurrency: activeInputCurrency, modalForOutputCurrency: outputCurrency } });
  };

  const evaluationResultForDisplay = lastValidResult;
  const effectiveEvaluationResult = calculateEffectiveValue(evaluationResultForDisplay, activeInputCurrency, appSettings);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={appSettings.darkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.calculatorContainer}>
        <View style={styles.currencyOutputWrapper}>
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
                    />
                );
            })}
        </View>
        <View style={styles.keypadWrapper}>
            <Keypad onKeyPress={handleKeypadPress} isModalOpen={false} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  calculatorContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  currencyOutputWrapper: {
    flex: 1,
  },
  keypadWrapper: {
    /* height: '60%' */ // Adjust as needed
    flex: 1,
  },
});

export default CalculatorScreen;

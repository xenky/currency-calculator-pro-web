import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Switch } from 'react-native';
import { Currency, AllExchangeRates, AppSettings, RateEntry } from '../types';
import { RateMatrix, createOrderedPairKey, getFullRateMatrix } from '../services/exchangeRateService';
import { CURRENCY_LABELS, CURRENCY_LABELS_SINGULAR, CURRENCY_VALUE_RANK } from '../constants';
import { formatNumberForDisplay, parseDisplayNumber } from '../services/calculatorService';
import { NumericInputKeypad } from './NumericInputKeypad';
import { CloseIcon } from './icons/CloseIcon';

let isNewRate = true;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalForInputCurrency: Currency;
  modalForOutputCurrency: Currency;
  officialRatesData: AllExchangeRates;
  manualRatesData: AllExchangeRates;
  preferredRateTypes: { [pairKey: string]: 'oficial' | 'manual' };
  rateMatrix: RateMatrix;
  onSaveManualRate: (base: Currency, quote: Currency, rate: number) => void;
  onSetPreferredRateType: (pairKey: string, type: 'oficial' | 'manual') => void;
  appSettings: AppSettings;
  onAppSettingsChange: (settings: AppSettings) => void;
  lastUpdateDate: string | null;
}

type RateTypeSelection = 'Oficial' | 'Manual';

const formatVenezuelanDate = (utcDateString: string | null): string => {
  if (!utcDateString) return 'No disponible';
  try {
    const date = new Date(utcDateString);
    if (isNaN(date.getTime())) throw new Error('Invalid date');
    // VET is UTC-4
    date.setHours(date.getHours() - 4);
    return date.toLocaleString('es-VE', {
      year: '2-digit',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).replace(/\. /g, '.');
  } catch (error) {
    console.error("Error formatting date:", error, "Input was:", utcDateString);
    return 'Fecha inválida';
  }
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, modalForInputCurrency, modalForOutputCurrency,
  officialRatesData, manualRatesData, preferredRateTypes,
  onSaveManualRate, onSetPreferredRateType,
  appSettings, onAppSettingsChange, lastUpdateDate
}) => {
  const [manualRateInput, setManualRateInput] = useState<string>('0,00');
  const [rateTypeSelection, setRateTypeSelection] = useState<RateTypeSelection>('Oficial');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  let displayBase: Currency, displayQuote: Currency;
  if (CURRENCY_VALUE_RANK[modalForInputCurrency] >= CURRENCY_VALUE_RANK[modalForOutputCurrency]) {
    displayBase = modalForInputCurrency;
    displayQuote = modalForOutputCurrency;
  } else {
    displayBase = modalForOutputCurrency;
    displayQuote = modalForInputCurrency;
  }

  const orderedPairKeyForStorage = createOrderedPairKey(modalForInputCurrency, modalForOutputCurrency);
  const officialRateEntryForPair = officialRatesData[orderedPairKeyForStorage];
  const manualRateEntryForPair = manualRatesData[orderedPairKeyForStorage];

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      const currentPreference = preferredRateTypes[orderedPairKeyForStorage];
      const manualRateExists = !!manualRateEntryForPair;
      let initialSelection: RateTypeSelection = (currentPreference === 'manual' || (!currentPreference && manualRateExists)) ? 'Manual' : 'Oficial';
      setRateTypeSelection(initialSelection);

      const rateEntryToUse: RateEntry | undefined = manualRateEntryForPair || officialRateEntryForPair;
      let initialManualInputValue = '0';
      if (rateEntryToUse) {
        const higherRank = orderedPairKeyForStorage.split('_')[0] as Currency;
        const valueForDisplay = displayBase === higherRank ? rateEntryToUse.value : 1 / rateEntryToUse.value;
        initialManualInputValue = formatNumberForDisplay(valueForDisplay, 2, true);
      }
      setManualRateInput(initialManualInputValue);
    }
  }, [isOpen, orderedPairKeyForStorage, officialRatesData, manualRatesData, preferredRateTypes, displayBase, displayQuote, manualRateEntryForPair, officialRateEntryForPair]);

  const handleNumericKeypadPress = (key: string) => {
    if (rateTypeSelection !== 'Manual') return;
    setErrorMessage(null);

    if (key === 'C') setManualRateInput('0');
    else if (key === '⌫') setManualRateInput(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    else if (key === ',') {
      if (!manualRateInput.includes(',')) setManualRateInput(manualRateInput + ',');
    } else {
      if (manualRateInput === '0' && key !== ',') setManualRateInput(key);
      else if (isNewRate) {
        setManualRateInput(key);
        isNewRate = false;
      } else {
        if (manualRateInput.length < 15) setManualRateInput(manualRateInput + key);
      }
    }
  };

  const handleSave = () => {
    if (rateTypeSelection === 'Manual') {
      const userInputRate = parseDisplayNumber(manualRateInput);
      if (isNaN(userInputRate) || userInputRate <= 0) {
        setErrorMessage('Tasa inválida. Ingrese un valor positivo.');
        return;
      }
      setErrorMessage(null);
      const rateToStore = displayBase === modalForInputCurrency ? userInputRate : 1 / userInputRate;
      onSaveManualRate(modalForInputCurrency, modalForOutputCurrency, rateToStore);
      onSetPreferredRateType(orderedPairKeyForStorage, 'manual');
    } else {
      onSetPreferredRateType(orderedPairKeyForStorage, 'oficial');
    }
    isNewRate = true;
    onClose();
  };

  const handleCopMultiplyToggle = () => {
    onAppSettingsChange({ ...appSettings, copMultiplyByThousand: !appSettings.copMultiplyByThousand });
  };

  let automaticRateDisplayString = 'Tasa Automática no disponible';
  const officialRateMatrix = getFullRateMatrix(officialRatesData, officialRatesData);
  const derivedRateFromMatrix = officialRateMatrix[displayBase]?.[displayQuote];

  if (officialRateEntryForPair) {
    const higherRank = orderedPairKeyForStorage.split('_')[0] as Currency;
    const value = displayBase === higherRank ? officialRateEntryForPair.value : 1 / officialRateEntryForPair.value;
    automaticRateDisplayString = `1 ${CURRENCY_LABELS_SINGULAR[displayBase]} = ${formatNumberForDisplay(value, 2, true)} ${CURRENCY_LABELS[displayQuote]} (Fuente: ${officialRateEntryForPair.source})`;
  } else if (derivedRateFromMatrix?.value > 0) {
    automaticRateDisplayString = `1 ${CURRENCY_LABELS_SINGULAR[displayBase]} = ${formatNumberForDisplay(derivedRateFromMatrix.value, 2, true)} ${CURRENCY_LABELS[displayQuote]} (Fuente: Derivada)`;
  }

  const saveButtonText = rateTypeSelection === 'Manual' ? 'Guardar Tasa Manual' : 'Usar Tasa Automática';
  const isSaveDisabled = errorMessage ? true : rateTypeSelection === 'Oficial' ? (preferredRateTypes[orderedPairKeyForStorage] === 'oficial' || (!preferredRateTypes[orderedPairKeyForStorage] && !manualRateEntryForPair)) : parseDisplayNumber(manualRateInput) <= 0;

  return (
    <Modal animationType="slide" transparent={false} visible={isOpen} onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-white dark:bg-slate-800">
        {/* Header */}
        <View className="flex-row justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <Text className="text-lg font-semibold text-slate-800 dark:text-white w-5/6" numberOfLines={1} ellipsizeMode="tail">
            Ajustar: {modalForInputCurrency} &rarr; {modalForOutputCurrency}
          </Text>
          <TouchableOpacity onPress={onClose} className="p-1 rounded-full">
            <CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Auto Rate Info */}
          <View className="mb-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tasa Automática Registrada:</Text>
            <Text className="text-base font-semibold text-indigo-600 dark:text-indigo-400">{automaticRateDisplayString}</Text>
            <View className="border-t border-slate-200 dark:border-slate-600 my-2" />
            <Text className="text-xs text-slate-500 dark:text-slate-400 text-right">Última actualización: {formatVenezuelanDate(lastUpdateDate)}</Text>
          </View>

          {/* Rate Type Selector */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Seleccionar Tipo de Tasa:</Text>
            <View className="flex-row space-x-4">
              {(['Oficial', 'Manual'] as RateTypeSelection[]).map(type => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setRateTypeSelection(type)}
                  className={`py-2 rounded-lg flex-1 items-center justify-center ${rateTypeSelection === type ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'}`}>
                  <Text className={`font-bold ${rateTypeSelection === type ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                    {type === 'Oficial' ? 'Automática' : 'Manual'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Manual Rate Section */}
          {rateTypeSelection === 'Manual' && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                1 {CURRENCY_LABELS_SINGULAR[displayBase]} ({displayBase}) =
              </Text>
              <View className={`flex-row items-center p-2 border rounded-lg bg-white dark:bg-slate-900 ${errorMessage ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}>
                <Text className="text-xl text-right flex-1 text-slate-800 dark:text-white">{manualRateInput}</Text>
                <Text className="text-sm text-slate-500 dark:text-slate-400 ml-2">{CURRENCY_LABELS[displayQuote]} ({displayQuote})</Text>
              </View>
              {errorMessage && <Text className="text-xs text-red-500 mt-1">{errorMessage}</Text>}
              <NumericInputKeypad onKeyPress={handleNumericKeypadPress} />
            </View>
          )}

          {/* COP Toggle */}
          {(modalForInputCurrency === 'COP' || modalForOutputCurrency === 'COP') && (
            <View className="mb-4 p-3 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1 mr-2">
                  Multiplicar entrada de COP por mil
                </Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#818cf8" }}
                  thumbColor={appSettings.copMultiplyByThousand ? "#4f46e5" : "#f4f3f4"}
                  onValueChange={handleCopMultiplyToggle}
                  value={appSettings.copMultiplyByThousand}
                />
              </View>
              <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Si al usar Pesos (COP) como moneda de entrada, ingresa '20' en lugar de '20.000', active esta opción.
              </Text>
            </View>
          )}
           <View className="h-20" />{/* Spacer for footer */}
        </ScrollView>

        {/* Footer */}
        <View className="flex-row justify-end space-x-3 p-4 border-t border-slate-200 dark:border-slate-700">
          <TouchableOpacity
            onPress={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600">
            <Text className="text-slate-700 dark:text-slate-200 font-bold">Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaveDisabled}
            className={`px-4 py-2 rounded-lg ${isSaveDisabled ? 'bg-slate-400 dark:bg-slate-500' : 'bg-indigo-600'}`}>
            <Text className="text-white font-bold">{saveButtonText}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
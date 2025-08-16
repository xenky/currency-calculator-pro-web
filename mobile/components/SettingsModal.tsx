import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Switch, StyleSheet } from 'react-native';
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
  const isDarkMode = appSettings.darkMode;

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

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDarkMode ? '#1e293b' : '#fff',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#334155' : '#e2e8f0',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDarkMode ? '#fff' : '#1e293b',
      width: '83.333333%',
    },
    closeButton: {
      padding: 4,
      borderRadius: 9999,
    },
    scrollView: {
      flex: 1,
      padding: 16,
    },
    autoRateInfo: {
      marginBottom: 16,
      padding: 12,
      backgroundColor: isDarkMode ? '#334155' : '#f1f5f9',
      borderRadius: 8,
    },
    autoRateTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: isDarkMode ? '#cbd5e1' : '#334155',
      marginBottom: 4,
    },
    autoRateValue: {
      fontSize: 16,
      fontWeight: '600',
      color: isDarkMode ? '#818cf8' : '#4f46e5',
    },
    divider: {
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? '#475569' : '#e2e8f0',
      marginVertical: 8,
    },
    lastUpdate: {
      fontSize: 12,
      color: isDarkMode ? '#94a3b8' : '#64748b',
      textAlign: 'right',
    },
    rateTypeSelector: {
      marginBottom: 16,
    },
    rateTypeTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: isDarkMode ? '#cbd5e1' : '#334155',
      marginBottom: 8,
    },
    rateTypeButtons: {
      flexDirection: 'row',
    },
    rateTypeButton: {
      paddingVertical: 8,
      borderRadius: 8,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 8,
    },
    selectedRateTypeButton: {
      backgroundColor: '#4f46e5',
    },
    unselectedRateTypeButton: {
      backgroundColor: isDarkMode ? '#475569' : '#e2e8f0',
    },
    selectedRateTypeText: {
      fontWeight: '700',
      color: '#fff',
    },
    unselectedRateTypeText: {
      fontWeight: '700',
      color: isDarkMode ? '#e2e8f0' : '#334155',
    },
    manualRateSection: {
      marginBottom: 16,
    },
    manualRateTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: isDarkMode ? '#cbd5e1' : '#334155',
      marginBottom: 4,
    },
    manualRateInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      borderWidth: 1,
      borderRadius: 8,
      backgroundColor: isDarkMode ? '#0f172a' : '#fff',
    },
    errorBorder: {
      borderColor: '#ef4444',
    },
    normalBorder: {
      borderColor: isDarkMode ? '#475569' : '#cbd5e1',
    },
    manualRateInput: {
      fontSize: 20,
      textAlign: 'right',
      flex: 1,
      color: isDarkMode ? '#fff' : '#1e293b',
    },
    manualRateCurrency: {
      fontSize: 14,
      color: isDarkMode ? '#94a3b8' : '#64748b',
      marginLeft: 8,
    },
    errorMessage: {
      fontSize: 12,
      color: '#ef4444',
      marginTop: 4,
    },
    copToggle: {
      marginBottom: 16,
      padding: 12,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: isDarkMode ? '#475569' : '#cbd5e1',
      borderRadius: 8,
    },
    copToggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    copToggleTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: isDarkMode ? '#cbd5e1' : '#334155',
      flex: 1,
      marginRight: 8,
    },
    copToggleDescription: {
      fontSize: 12,
      color: isDarkMode ? '#94a3b8' : '#64748b',
      marginTop: 4,
    },
    spacer: {
      height: 80,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? '#334155' : '#e2e8f0',
    },
    cancelButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: isDarkMode ? '#475569' : '#e2e8f0',
      marginHorizontal: 6,
    },
    cancelButtonText: {
      color: isDarkMode ? '#e2e8f0' : '#334155',
      fontWeight: '700',
    },
    saveButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    disabledSaveButton: {
      backgroundColor: isDarkMode ? '#64748b' : '#94a3b8',
    },
    enabledSaveButton: {
      backgroundColor: '#4f46e5',
    },
    saveButtonText: {
      color: '#fff',
      fontWeight: '700',
    },
  });

  return (
    <Modal animationType="slide" transparent={false} visible={isOpen} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            Ajustar: {modalForInputCurrency} &rarr; {modalForOutputCurrency}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <CloseIcon width={24} height={24} stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.autoRateInfo}>
            <Text style={styles.autoRateTitle}>Tasa Automática Registrada:</Text>
            <Text style={styles.autoRateValue}>{automaticRateDisplayString}</Text>
            <View style={styles.divider} />
            <Text style={styles.lastUpdate}>Última actualización: {formatVenezuelanDate(lastUpdateDate)}</Text>
          </View>

          <View style={styles.rateTypeSelector}>
            <Text style={styles.rateTypeTitle}>Seleccionar Tipo de Tasa:</Text>
            <View style={styles.rateTypeButtons}>
              {(['Oficial', 'Manual'] as RateTypeSelection[]).map(type => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setRateTypeSelection(type)}
                  style={[styles.rateTypeButton, rateTypeSelection === type ? styles.selectedRateTypeButton : styles.unselectedRateTypeButton]}>
                  <Text style={rateTypeSelection === type ? styles.selectedRateTypeText : styles.unselectedRateTypeText}>
                    {type === 'Oficial' ? 'Automática' : 'Manual'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {rateTypeSelection === 'Manual' && (
            <View style={styles.manualRateSection}>
              <Text style={styles.manualRateTitle}>
                1 {CURRENCY_LABELS_SINGULAR[displayBase]} ({displayBase}) =
              </Text>
              <View style={[styles.manualRateInputContainer, errorMessage ? styles.errorBorder : styles.normalBorder]}>
                <Text style={styles.manualRateInput}>{manualRateInput}</Text>
                <Text style={styles.manualRateCurrency}>{CURRENCY_LABELS[displayQuote]} ({displayQuote})</Text>
              </View>
              {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
              <NumericInputKeypad onKeyPress={handleNumericKeypadPress} />
            </View>
          )}

          {(modalForInputCurrency === 'COP' || modalForOutputCurrency === 'COP') && (
            <View style={styles.copToggle}>
              <View style={styles.copToggleContainer}>
                <Text style={styles.copToggleTitle}>
                  Multiplicar entrada de COP por mil
                </Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#818cf8" }}
                  thumbColor={appSettings.copMultiplyByThousand ? "#4f46e5" : "#f4f3f4"}
                  onValueChange={handleCopMultiplyToggle}
                  value={appSettings.copMultiplyByThousand}
                />
              </View>
              <Text style={styles.copToggleDescription}>
                Si al usar Pesos (COP) como moneda de entrada, ingresa '20' en lugar de '20.000', active esta opción.
              </Text>
            </View>
          )}
           <View style={styles.spacer} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaveDisabled}
            style={[styles.saveButton, isSaveDisabled ? styles.disabledSaveButton : styles.enabledSaveButton]}>
            <Text style={styles.saveButtonText}>{saveButtonText}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

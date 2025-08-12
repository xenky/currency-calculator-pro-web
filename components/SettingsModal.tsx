import React, { useState, useEffect } from 'react';
import { Currency, AllExchangeRates, AppSettings, RateEntry } from '../types';
import { RateMatrix, createOrderedPairKey, getFullRateMatrix } from '../services/exchangeRateService';
import { CURRENCY_LABELS, CURRENCY_LABELS_SINGULAR, CURRENCY_VALUE_RANK } from '../constants';
import { formatNumberForDisplay, parseDisplayNumber } from '../services/calculatorService';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import { NumericInputKeypad } from './NumericInputKeypad';
import { CloseIcon } from './icons/CloseIcon';
import styles from './styles/component.module.css';

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
  isMobileLandscape?: boolean;
}

type RateTypeSelection = 'Oficial' | 'Manual';

const formatVenezuelanDate = (utcDateString: string | null): string => {
  if (!utcDateString) return 'No disponible';

  try {
    // Formato esperado: "DD/MM/YYYY HH:mm AM/PM"
    const parts = utcDateString.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{1,2}):(\d{2}) (AM|PM)/i);

    if (!parts) {
      // Fallback por si el formato cambia a uno estándar en el futuro
      const fallbackDate = new Date(utcDateString);
      if (isNaN(fallbackDate.getTime())) {
        throw new Error('Invalid date format after fallback');
      }
      fallbackDate.setHours(fallbackDate.getHours() - 4);
      const formatted = fallbackDate.toLocaleString('es-VE', {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      // Corrige el formato de "p. m." a "p.m."
      return formatted.replace(/\. /g, '.');
    }

    const [, dayStr, monthStr, yearStr, hourStr, minuteStr, ampm] = parts;
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);
    let hours = parseInt(hourStr, 10);
    const minutes = parseInt(minuteStr, 10);

    if (ampm.toLowerCase() === 'pm' && hours < 12) {
      hours += 12;
    }
    if (ampm.toLowerCase() === 'am' && hours === 12) { // Caso de medianoche (12 AM)
      hours = 0;
    }

    // Crear la fecha en UTC. El mes en JS es 0-indexado.
    const date = new Date(Date.UTC(year, month - 1, day, hours, minutes));

    // Restar 4 horas para ajustar de UTC a VET (UTC-4)
    date.setUTCHours(date.getUTCHours() - 4);

    // Formatear la fecha manualmente para asegurar el formato exacto
    const finalDay = date.getUTCDate();
    const finalMonth = date.getUTCMonth() + 1;
    const finalYear = date.getUTCFullYear().toString().slice(-2);
    let finalHours = date.getUTCHours();
    const finalMinutes = date.getUTCMinutes();
    const finalAmpm = finalHours >= 12 ? 'p.m.' : 'a.m.';

    finalHours = finalHours % 12;
    finalHours = finalHours || 12; // La hora 0 debe ser 12

    const formattedMinutes = finalMinutes < 10 ? '0' + finalMinutes : finalMinutes;

    return `${finalDay}/${finalMonth}/${finalYear}, ${finalHours}:${formattedMinutes} ${finalAmpm}`;

  } catch (error) {
    console.error("Error formatting date:", error, "Input was:", utcDateString);
    return 'Fecha inválida';
  }
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, modalForInputCurrency, modalForOutputCurrency,
  officialRatesData, manualRatesData, preferredRateTypes,
  rateMatrix,
  onSaveManualRate, onSetPreferredRateType,
  appSettings, onAppSettingsChange, lastUpdateDate, isMobileLandscape
}) => {
  const [manualRateInput, setManualRateInput] = useState<string>('0,00');
  const [rateTypeSelection, setRateTypeSelection] = useState<RateTypeSelection>('Oficial');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualRateAnimationClass, setManualRateAnimationClass] = useState<string>('');

  useEffect(() => {
    if (rateTypeSelection === 'Manual') {
      setManualRateAnimationClass('rotate-right');
    } else {
      setManualRateAnimationClass('rotate-left');
    }
  }, [rateTypeSelection]);

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

      let initialSelection: RateTypeSelection = 'Oficial';
      if (currentPreference === 'manual') {
        initialSelection = 'Manual';
      } else if (currentPreference === 'oficial') {
        initialSelection = 'Oficial';
      } else {
        initialSelection = manualRateExists ? 'Manual' : 'Oficial';
      }
      setRateTypeSelection(initialSelection);

      let initialManualInputValue = '0';
      const rateEntryToUseForManualField: RateEntry | undefined = manualRateEntryForPair || officialRateEntryForPair;

      if (rateEntryToUseForManualField) {
        const higherRankCurrencyOfPair = orderedPairKeyForStorage.split('_')[0] as Currency;
        let valueForDisplay: number;
        if (displayBase === higherRankCurrencyOfPair) {
          valueForDisplay = rateEntryToUseForManualField.value;
        } else {
          valueForDisplay = 1 / rateEntryToUseForManualField.value;
        }
        initialManualInputValue = formatNumberForDisplay(valueForDisplay, 2, true);
      }
      setManualRateInput(initialManualInputValue);
    }
  }, [isOpen, orderedPairKeyForStorage, officialRatesData, manualRatesData, preferredRateTypes, displayBase, displayQuote, manualRateEntryForPair, officialRateEntryForPair]);


  const handleNumericKeypadPress = (key: string) => {
    if (rateTypeSelection !== 'Manual') return;
    setErrorMessage(null);

    if (key === 'C') {
      setManualRateInput('0');
    } else if (key === '⌫') {
      setManualRateInput(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (key === ',') {
      if (!manualRateInput.includes(',')) {
        setManualRateInput(manualRateInput + ',');
      }
    } else {
      if (manualRateInput === '0' && key !== ',') {
        setManualRateInput(key);
      } else if (isNewRate) {
        setManualRateInput(key);
        isNewRate = false;
      } else {
        if (manualRateInput.length < 15) {
          setManualRateInput(manualRateInput + key);
        }
      }
    }
  };

  const handleSave = () => {
    if (rateTypeSelection === 'Manual') {
      const userInputRate = parseDisplayNumber(manualRateInput);
      if (isNaN(userInputRate) || userInputRate <= 0) {
        setErrorMessage('Por favor ingrese una tasa de cambio válida y positiva.');
        return;
      }
      setErrorMessage(null);

      let rateToStoreForActualPair: number;
      if (displayBase === modalForInputCurrency) {
        rateToStoreForActualPair = userInputRate;
      } else {
        rateToStoreForActualPair = 1 / userInputRate;
      }
      onSaveManualRate(modalForInputCurrency, modalForOutputCurrency, rateToStoreForActualPair);
      onSetPreferredRateType(orderedPairKeyForStorage, 'manual');
      
    } else { // rateTypeSelection === 'Oficial'
      onSetPreferredRateType(orderedPairKeyForStorage, 'oficial');
    }
    isNewRate = true;
    onClose();
  };

  const handleCopMultiplyToggle = () => {
    onAppSettingsChange({ ...appSettings, copMultiplyByThousand: !appSettings.copMultiplyByThousand });
  };

  useKeyboardShortcut([
    { key: 'a', handler: () => setRateTypeSelection('Oficial') },
    { key: 'm', handler: () => setRateTypeSelection('Manual') },
    { key: 'Enter', handler: handleSave },
    { key: 'Escape', handler: onClose },
  ], { disabled: !isOpen });

  if (!isOpen) return null;

  let automaticRateDisplayString = 'Tasa Automática no disponible';
  // Create a matrix based purely on official rates to show the correct automatic rate.
  const officialRateMatrix = getFullRateMatrix(officialRatesData, officialRatesData);
  const derivedRateFromMatrix = officialRateMatrix[displayBase]?.[displayQuote];

  if (officialRateEntryForPair) {
    let officialValueForDisplay: number;
    const higherRankCurrencyOfPair = orderedPairKeyForStorage.split('_')[0] as Currency;
    if (displayBase === higherRankCurrencyOfPair) {
      officialValueForDisplay = officialRateEntryForPair.value;
    } else {
      officialValueForDisplay = 1 / officialRateEntryForPair.value;
    }
    automaticRateDisplayString = `1 ${CURRENCY_LABELS_SINGULAR[displayBase]} = ${formatNumberForDisplay(officialValueForDisplay, 2, true)} ${CURRENCY_LABELS[displayQuote]} (Fuente: ${officialRateEntryForPair.source})`;
  } else if (derivedRateFromMatrix && derivedRateFromMatrix.value > 0 && derivedRateFromMatrix.source !== 'No Disponible') {
    automaticRateDisplayString = `1 ${CURRENCY_LABELS_SINGULAR[displayBase]} = ${formatNumberForDisplay(derivedRateFromMatrix.value, 2, true)} ${CURRENCY_LABELS[displayQuote]} (Fuente: Derivada)`;
  }

  const saveButtonText = rateTypeSelection === 'Manual' ? 'Guardar Tasa Manual' : 'Usar Tasa Automática';
  let saveButtonDisabled = false;

  if (errorMessage) {
    saveButtonDisabled = true;
  } else if (rateTypeSelection === 'Oficial') {
    const currentActivePreference = preferredRateTypes[orderedPairKeyForStorage];
    const isEffectivelyOfficial = currentActivePreference === 'oficial' || (!currentActivePreference && !manualRateEntryForPair);
    if (isEffectivelyOfficial) {
      saveButtonDisabled = true;
    }
  } else { // Manual
    if (parseDisplayNumber(manualRateInput) <= 0) {
      saveButtonDisabled = true;
    }
  }

  return (
    <div className="absolute inset-0">
      {!isMobileLandscape ? (
        <div className=' absolute inset-0 bg-white dark:bg-slate-800 z-50 flex flex-col '>
          {/* Header (Contenedor 1) */}
          <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-white">
              Ajustar Tasa: {modalForInputCurrency} &rarr; {modalForOutputCurrency}
            </h2>
            <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full" aria-label="Cerrar modal" title="Salir (Esc)">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto custom-scrollbar p-4 sm:p-6">
            {/* Contenedor 2: Tasa Automática Registrada */}
            <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-700 rounded">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tasa Automática Registrada:</p>
              <p className="text-md sm:text-lg font-semibold text-indigo-600 dark:text-indigo-400">{automaticRateDisplayString}</p>
              <hr className="my-2 border-slate-200 dark:border-slate-600" />
              <p className="text-xs text-slate-500 dark:text-slate-400 text-right">Última actualización: {formatVenezuelanDate(lastUpdateDate)}</p>
            </div>

            {/* Contenedor 3: Seleccionar Tipo de Tasa */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Seleccionar Tipo de Tasa:</label>
              <div className="flex space-x-2 sm:space-x-4">
                {(['Oficial', 'Manual'] as RateTypeSelection[]).map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      setRateTypeSelection(type);
                      setErrorMessage(null); // Clear error message when switching types
                      if (type === 'Manual') {
                        // When switching to manual, ensure manualRateInput reflects the stored manual rate or official as fallback
                        let valToSet = '0,00';
                        const rateEntryForManualField: RateEntry | undefined = manualRateEntryForPair || officialRateEntryForPair;
                        if (rateEntryForManualField) {
                          const higherRank = orderedPairKeyForStorage.split('_')[0] as Currency;
                          let valueForDisplay: number;
                          if (displayBase === higherRank) {
                            valueForDisplay = rateEntryForManualField.value;
                          } else {
                            valueForDisplay = 1 / rateEntryForManualField.value;
                          }
                          valToSet = formatNumberForDisplay(valueForDisplay, 2, true);
                        }
                        setManualRateInput(valToSet);
                        isNewRate = true;
                      }
                    }}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded w-full
                            ${rateTypeSelection === type ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500'}`}
                    title={`Seleccionar Tasa ${type === 'Oficial' ? 'Automática (A)' : 'Manual (M)'}`}
                  >
                    Tasa {type === 'Oficial' ? 'Automática' : 'Manual'}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Rate Section with Animation */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${rateTypeSelection === 'Manual' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="mb-4 pt-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Establecer Tasa Manual: 1 {CURRENCY_LABELS_SINGULAR[displayBase]} ({displayBase}) =
                </label>
                <div className={`w-full p-2 border ${errorMessage && rateTypeSelection === 'Manual' ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-right text-xl h-10 flex items-center justify-end`}>
                  {manualRateInput}
                  <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">{CURRENCY_LABELS[displayQuote]} ({displayQuote})</span>
                </div>
                {errorMessage && rateTypeSelection === 'Manual' && <p className="text-xs text-red-500 mt-1">{errorMessage}</p>}
                <NumericInputKeypad onKeyPress={handleNumericKeypadPress} isModalOpen={isOpen} />
              </div>
            </div>

            {(modalForInputCurrency === 'COP' || modalForOutputCurrency === 'COP') && (
              <div className="mb-4 p-3 border border-dashed border-slate-300 dark:border-slate-600 rounded">
                <div className="flex items-center justify-between">
                  <label htmlFor="copMultiply" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1 mr-2">
                    Multiplicar entrada de COP por mil
                  </label>
                  <input
                    type="checkbox"
                    id="copMultiply"
                    checked={appSettings.copMultiplyByThousand}
                    onChange={handleCopMultiplyToggle}
                    className="h-5 w-5 text-indigo-600 border-slate-300 dark:border-gray-500 rounded focus:ring-indigo-500"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Si al usar Pesos (COP) como moneda de entrada principal, ingresa '20' en lugar de '20.000', active esta opción.
                </p>
              </div>
            )}
          </div>
          {/* Footer */}
          <div className={`flex-shrink-0 mt-auto p-4 flex justify-end space-x-2 sm:space-x-3 border-t border-slate-200 dark:border-slate-700 pb-[calc(1rem+env(safe-area-inset-bottom))] ${isMobileLandscape ? styles['settings-modal-footer-fixed'] : ''}`}>
            <button
              onClick={onClose}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
              title="Salir sin guardar (Esc)"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saveButtonDisabled}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-500 transition-colors"
              title="Guardar cambios (Enter)"
            >
              {saveButtonText} 
            </button>
          </div>
        </div>
      ) : (
        <div className=' absolute inset-0 overflow-y-hidden bg-white dark:bg-slate-800 z-50 flex flex-col pt-2'>
          <div className="flex flex-grow h-full">
            {/* Left Column */}
            <div className={`flex flex-col ${styles['settings-modal-left-column']} `}>
              <div className=" overflow-y-auto custom-scrollbar ">{/* Header (Contenedor 1) */}
                <div className="flex-shrink-0 flex justify-between items-center p-1 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-lg sm:text-md font-semibold text-slate-800 dark:text-white">
                    Ajustar Tasa:  {modalForInputCurrency} &rarr; {modalForOutputCurrency}
                  </h2>
                  <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full" aria-label="Cerrar modal" title="Salir (Esc)">
                    <CloseIcon className="w-6 h-6" />
                  </button>
                </div>
                {/* Contenedor 2: Tasa Automática Registrada */}
                <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-700 rounded">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tasa Automática Registrada:</p>
                  <p className="text-md sm:text-lg font-semibold text-indigo-600 dark:text-indigo-400">{automaticRateDisplayString}</p>
                  <hr className="my-2 border-slate-200 dark:border-slate-600" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-right">Última actualización: {formatVenezuelanDate(lastUpdateDate)}</p>
                </div>

                {/* Contenedor 3: Seleccionar Tipo de Tasa */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Seleccionar Tipo de Tasa:</label>
                  <div className="flex space-x-2 sm:space-x-4">
                    {(['Oficial', 'Manual'] as RateTypeSelection[]).map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          setRateTypeSelection(type);
                          setErrorMessage(null); // Clear error message when switching types
                          if (type === 'Manual') {
                            // When switching to manual, ensure manualRateInput reflects the stored manual rate or official as fallback
                            let valToSet = '0,00';
                            const rateEntryForManualField: RateEntry | undefined = manualRateEntryForPair || officialRateEntryForPair;
                            if (rateEntryForManualField) {
                              const higherRank = orderedPairKeyForStorage.split('_')[0] as Currency;
                              let valueForDisplay: number;
                              if (displayBase === higherRank) {
                                valueForDisplay = rateEntryForManualField.value;
                              } else {
                                valueForDisplay = 1 / rateEntryForManualField.value;
                              }
                              valToSet = formatNumberForDisplay(valueForDisplay, 2, true);
                            }
                            setManualRateInput(valToSet);
                          }
                        }}
                        className={`px-3 py-1 sm:px-4 sm:py-1 text-sm sm:text-base rounded w-full
                            ${rateTypeSelection === type ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500'}`}
                        title={`Seleccionar Tasa ${type === 'Oficial' ? 'Automática (A)' : 'Manual (M)'}`}
                      >
                        Tasa {type === 'Oficial' ? 'Automática' : 'Manual'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contenedor 5: Multiplicar entrada de COP por mil */}
                {(modalForInputCurrency === 'COP' || modalForOutputCurrency === 'COP') && (
                  <div className="mb-4 p-3 border border-dashed border-slate-300 dark:border-slate-600 rounded">
                    <div className="flex items-center justify-between">
                      <label htmlFor="copMultiply" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1 mr-2">
                        Multiplicar entrada de COP por mil
                      </label>
                      <input
                        type="checkbox"
                        id="copMultiply"
                        checked={appSettings.copMultiplyByThousand}
                        onChange={handleCopMultiplyToggle}
                        className="h-5 w-5 text-indigo-600 border-slate-300 dark:border-gray-500 rounded focus:ring-indigo-500"
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Si al usar Pesos (COP) como moneda de entrada principal, ingresas '20' en lugar de '20.000', activa esta opción.
                    </p>
                  </div>
                )}
              </div>
              {/* Footer */}
              <div className={`flex-shrink-0 mt-auto p-2 flex justify-end space-x-2 sm:space-x-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 pb-[calc(1rem+env(safe-area-inset-bottom))] ${styles['settings-modal-footer-fixed']} `}>
                <button
                  onClick={onClose}
                  className="px-3 py-1 sm:px-4 sm:py-1 text-sm sm:text-base rounded bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                  title="Salir sin guardar (Esc)"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveButtonDisabled}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-500 transition-colors"
                  title="Guardar cambios (Enter)"
                >
                  {saveButtonText}
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className={` flex flex-grow  ${styles['settings-modal-right-column']} ${rateTypeSelection === 'Oficial' ? styles['manual-rate-disabled'] : ''} ${manualRateAnimationClass}`}>
              {/* Contenedor 4: Establecer Tasa Manual + NumericInputKeypad */}
              <div className="mb-4 pb-10 pt-1 h-full">
                <div className={`w-full p-2 border ${errorMessage && rateTypeSelection === 'Manual' ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-right text-xl h-10 flex items-center justify-between `}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1  ">
                    1 ({displayBase}) =
                  </label>
                  <span>
                    {manualRateInput}
                    <span className="text-sm text-slate-500 dark:text-slate-400 ml-2"> ({displayQuote})</span></span>
                </div>
                {errorMessage && rateTypeSelection === 'Manual' && <p className="text-xs text-red-500 mt-1">{errorMessage}</p>}
                <NumericInputKeypad onKeyPress={handleNumericKeypadPress} isModalOpen={isOpen} isMobileLandscape={isMobileLandscape} />
              </div>
            </div>
          </div>

        </div>
      )}</div>
  )
};
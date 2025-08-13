import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Currency, ConversionRateInfo } from '../types';
import { CURRENCY_LABELS } from '../constants';
import { formatNumberForDisplay } from '../services/calculatorService';
import { SettingsIcon } from './icons/SettingsIcon';

interface CurrencyOutputProps {
  currency: Currency;
  value: number | null;
  rateInfo: ConversionRateInfo | null;
  onSettingsClick: () => void;
  isInputCurrency: boolean;
  onCurrencySelect: (currency: Currency) => void;
  inputDisplayComponent?: React.ReactNode;
  className?: string;
  isMobileLandscape?: boolean; // This will be ignored for now
}

export const CurrencyOutput: React.FC<CurrencyOutputProps> = ({
  currency,
  value,
  rateInfo,
  onSettingsClick,
  isInputCurrency,
  onCurrencySelect,
  inputDisplayComponent,
  className,
}) => {
  const formattedValue = value !== null ? formatNumberForDisplay(value, 2, true) : '-.--';

  const handleCardClick = () => {
    if (!isInputCurrency) {
      onCurrencySelect(currency);
    }
  };

  if (isInputCurrency && inputDisplayComponent) {
    return <>{inputDisplayComponent}</>;
  }

  return (
    <TouchableOpacity 
      className={`space-y-1 p-1 ${className || ''}`} 
      onPress={handleCardClick}
      accessibilityLabel={`Seleccionar ${CURRENCY_LABELS[currency]}`}
    >
      <View className="py-px rounded-lg shadow flex-row items-center h-full justify-between px-2 bg-white dark:bg-slate-700">
        <View className='flex-col flex-grow h-full justify-between truncate min-w-0'>
          <Text className="text-sm font-medium text-slate-600 dark:text-slate-300">{CURRENCY_LABELS[currency]}</Text>
          <Text className="text-xl text-right font-mono text-slate-800 dark:text-white truncate mb-px">
            {formattedValue}
          </Text>
          {rateInfo && (
            <Text className="text-xs text-right text-slate-500 dark:text-slate-400 truncate pt-px">
              {rateInfo.source} - {rateInfo.pair}: {formatNumberForDisplay(rateInfo.value, 2, true)}
            </Text>
          )}
          {value === null && !rateInfo?.value && (
            <Text className="text-xs text-right text-red-500 dark:text-red-400">
              Tasa no disponible
            </Text>
          )}
        </View>
        <TouchableOpacity 
          onPress={onSettingsClick} 
          className="p-1 ml-2 flex-shrink-0 h-full flex items-center"
          accessibilityLabel={`Ajustar tasa para ${currency}`}
        >
          <SettingsIcon className="h-1/2 w-auto text-slate-500 dark:text-white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
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
}

export const CurrencyOutput: React.FC<CurrencyOutputProps> = ({
  currency,
  value,
  rateInfo,
  onSettingsClick,
  isInputCurrency,
  onCurrencySelect,
  inputDisplayComponent,
}) => {
  const formattedValue = value !== null ? formatNumberForDisplay(value, 2, true) : '-.--';
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const handleCardClick = () => {
    if (!isInputCurrency) {
      onCurrencySelect(currency);
    }
  };

  if (isInputCurrency && inputDisplayComponent) {
    return <>{inputDisplayComponent}</>;
  }

  const styles = StyleSheet.create({
    root: {
      padding: 4,
    },
    container: {
      paddingVertical: 1,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      flexDirection: 'row',
      alignItems: 'center',
      height: '100%',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
      backgroundColor: isDarkMode ? '#334155' : '#fff',
    },
    textContainer: {
      flexDirection: 'column',
      flexGrow: 1,
      height: '100%',
      justifyContent: 'space-between',
      minWidth: 0,
    },
    currencyLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: isDarkMode ? '#cbd5e1' : '#475569',
    },
    value: {
      fontSize: 20,
      textAlign: 'right',
      fontFamily: 'monospace',
      color: isDarkMode ? '#fff' : '#1e293b',
      marginBottom: 1,
    },
    rateInfo: {
      fontSize: 12,
      textAlign: 'right',
      color: isDarkMode ? '#94a3b8' : '#64748b',
      paddingTop: 1,
    },
    error: {
      fontSize: 12,
      textAlign: 'right',
      color: isDarkMode ? '#f87171' : '#ef4444',
    },
    settingsTouchable: {
      padding: 4,
      marginLeft: 8,
      flexShrink: 0,
      height: '100%',
      alignItems: 'center',
    },
  });

  return (
    <TouchableOpacity 
      style={styles.root}
      onPress={handleCardClick}
      accessibilityLabel={`Seleccionar ${CURRENCY_LABELS[currency]}`}
    >
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.currencyLabel} numberOfLines={1}>{CURRENCY_LABELS[currency]}</Text>
          <Text style={styles.value} numberOfLines={1}>
            {formattedValue}
          </Text>
          {rateInfo && (
            <Text style={styles.rateInfo} numberOfLines={1}>
              {rateInfo.source} - {rateInfo.pair}: {formatNumberForDisplay(rateInfo.value, 2, true)}
            </Text>
          )}
          {value === null && !rateInfo?.value && (
            <Text style={styles.error}>
              Tasa no disponible
            </Text>
          )}
        </View>
        <TouchableOpacity 
          onPress={onSettingsClick} 
          style={styles.settingsTouchable}
          accessibilityLabel={`Ajustar tasa para ${currency}`}
        >
          <SettingsIcon height="50%"  fill={isDarkMode ? '#fff' : '#64748b'} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};
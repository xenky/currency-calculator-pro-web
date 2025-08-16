import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import { Currency } from '../types';
import { CURRENCY_LABELS } from '../constants';
import { formatNumberForDisplay } from '../services/calculatorService';

interface InputDisplayProps {
  value: string;
  activeInputCurrency: Currency;
  evaluationResult: number;
}

export const InputDisplay: React.FC<InputDisplayProps> = ({ value, activeInputCurrency, evaluationResult }) => {
  const formattedResult = formatNumberForDisplay(evaluationResult, 2, true);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const getDisplayFontSize = () => {
    if (value.length > 20) return styles.font2xl;
    if (value.length > 13) return styles.font3xl;
    return styles.font4xl;
  };

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: false });
  }, [value]);

  const styles = StyleSheet.create({
    root: {
      paddingVertical: 4,
      flexDirection: 'column',
      alignContent: 'space-around',
    },
    container: {
      borderRadius: 8,
      backgroundColor: isDarkMode ? '#312e81' : '#c7d2fe',
      borderWidth: 2,
      borderColor: isDarkMode ? '#4f46e5' : '#818cf8',
      marginHorizontal: 4,
      justifyContent: 'space-between',
      padding: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    currencyLabelContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 8,
      marginBottom: 4, // for space-y-1
    },
    currencyLabel: {
      fontWeight: '500',
      color: isDarkMode ? '#fff' : '#475569',
      fontSize: 14,
    },
    inputValueContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4, // for space-y-1
    },
    scrollView: {
      flexGrow: 1,
    },
    scrollViewContent: {
      flexGrow: 1,
      justifyContent: 'flex-end',
    },
    inputValue: {
      textAlign: 'right',
      color: isDarkMode ? '#fff' : '#475569',
      fontFamily: 'monospace',
      marginHorizontal: 12,
      marginBottom: -6,
    },
    result: {
      color: isDarkMode ? '#34d399' : '#059669',
      marginHorizontal: 12,
      textAlign: 'right',
      fontSize: 16,
    },
    font2xl: { fontSize: 24 },
    font3xl: { fontSize: 30 },
    font4xl: { fontSize: 36 },
  });

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <View style={styles.currencyLabelContainer}>
          <Text style={styles.currencyLabel}>
            {CURRENCY_LABELS[activeInputCurrency]}
          </Text>
        </View>

        <View style={styles.inputValueContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
          >
            <Text style={[styles.inputValue, getDisplayFontSize()]}>
              {value || '0'}
            </Text>
          </ScrollView>
        </View>
        
        <Text style={styles.result} numberOfLines={1}>
          {formattedResult || '0'}
        </Text>

      </View>
    </View>
  );
};
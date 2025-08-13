import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
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
  
  // Simplified dynamic font size logic for mobile
  const displayFontSize = value.length > 20 ? 'text-2xl' : value.length > 13 ? 'text-3xl' : 'text-4xl';

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to the end of the input when the value changes
    scrollViewRef.current?.scrollToEnd({ animated: false });
  }, [value]);

  return (
    <View className="py-1 flex-col content-around">
      <View className="rounded-lg shadow bg-indigo-200 dark:bg-indigo-900 border-2 border-indigo-400 dark:border-indigo-600 mx-1 justify-between space-y-1 p-1">
        
        {/* Currency Label */}
        <View className="flex-row justify-between items-center px-2">
          <Text className="font-medium text-slate-600 dark:text-white text-sm">
            {CURRENCY_LABELS[activeInputCurrency]}
          </Text>
        </View>

        {/* Input Value (Scrollable) */}
        <View className="flex-row items-center">
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-grow"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }} // Ensures text aligns right
          >
            <Text
              className={`text-right text-slate-600 dark:text-white font-mono ${displayFontSize} mx-3`}
              style={{ marginBottom: -6 }} // Replicating the negative margin from CSS
            >
              {value || '0'}
            </Text>
          </ScrollView>
        </View>
        
        {/* Result */}
        <Text className="text-emerald-600 dark:text-emerald-400 mx-3 text-right truncate text-base">
          {formattedResult || '0'}
        </Text>

      </View>
    </View>
  );
};

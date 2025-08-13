import React from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { HistoryEntry } from '../types';
import { CURRENCIES, CURRENCY_LABELS, CURRENCY_SYMBOLS } from '../constants';
import { TrashIcon } from './icons/TrashIcon';
import { formatNumberForDisplay } from '../services/calculatorService';

interface HistoryScreenProps {
  history: HistoryEntry[];
  clearHistory: () => void;
}

const HistoryItem: React.FC<{ entry: HistoryEntry }> = ({ entry }) => (
  <View className="text-sm p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md flex-col space-y-2">
    <View>
      <Text className="text-xs text-slate-500 dark:text-slate-400">
        Moneda de entrada: <Text className="font-semibold">{CURRENCY_LABELS[entry.inputCurrency]}</Text>
      </Text>
    </View>
    <Text className="text-lg text-slate-700 dark:text-slate-200 font-mono" selectable>
      {entry.expression}
    </Text>
    <View className="flex-row items-center">
      <Text className="font-normal text-slate-800 dark:text-slate-200 mr-2">=</Text>
      <View className="flex-1 flex-row flex-wrap">
        {CURRENCIES.map((currency, index) => (
          <React.Fragment key={currency}>
            <View className="flex-row items-baseline">
              <Text className="text-base font-semibold text-indigo-600 dark:text-indigo-400">{formatNumberForDisplay(entry.results[currency] || 0, 2, true)}</Text>
              <Text className="text-sm font-normal ml-1 text-slate-600 dark:text-slate-300">{CURRENCY_SYMBOLS[currency]}</Text>
            </View>
            {index < CURRENCIES.length - 1 && <Text className="mx-1.5 text-slate-400 dark:text-slate-500">-</Text>}
          </React.Fragment>
        ))}
      </View>
    </View>
    <View className="border-t border-slate-200 dark:border-slate-700 mt-2 pt-2">
      <Text className="text-xs text-slate-400 dark:text-slate-500 text-right">
        {new Date(entry.timestamp).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })}
      </Text>
    </View>
  </View>
);

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ history, clearHistory }) => {
  const validHistory = history.filter(entry => entry.results && entry.inputCurrency);

  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-900">
      <View className="p-4 flex-1">
        {validHistory.length > 0 && (
          <View className="mb-4 flex-row justify-end">
            <TouchableOpacity 
              onPress={clearHistory} 
              className="flex-row items-center px-4 py-2 bg-red-500 active:bg-red-600 text-white text-sm font-medium rounded-lg shadow"
              accessibilityLabel="Limpiar historial"
            >
              <TrashIcon className="w-4 h-4 mr-2 text-white" />
              <Text className="text-white font-bold">Limpiar Historial</Text>
            </TouchableOpacity>
          </View>
        )}
        {validHistory.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-slate-500 dark:text-slate-400 text-lg">No hay operaciones en el historial.</Text>
          </View>
        ) : (
          <FlatList
            data={validHistory}
            renderItem={({ item }) => <HistoryItem entry={item} />}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View className="h-3" />} // space-y-3
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};